from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
import logging

from models.chat import (
    ChatMessage, 
    ChatMessageResponse, 
    SendChatRequest,
    ApplySuggestionRequest,
    ChatContext
)
from services.gemini_service import GeminiService
from utils.auth_utils import get_current_user
from routes.auth import get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["AI Chat"])

# Initialize services
gemini_service = GeminiService()

@router.post("/chat")
async def send_chat_message(
    request: SendChatRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Send a chat message and get AI response
    
    The AI assistant is context-aware and knows about:
    - Current presentation
    - Current slide content
    - Previous chat history
    """
    try:
        user_id = current_user['id']
        
        # Verify user owns this presentation
        presentation = await db.presentations.find_one({
            "id": request.presentation_id,
            "user_id": user_id
        })
        
        if not presentation:
            raise HTTPException(status_code=404, detail="Presentation not found")
        
        # Save user message
        user_message = ChatMessage(
            presentation_id=request.presentation_id,
            user_id=user_id,
            role="user",
            content=request.message,
            context=request.context
        )
        
        await db.chat_messages.insert_one(user_message.model_dump())
        
        # Get recent chat history for context (last 10 messages)
        chat_history = await db.chat_messages.find({
            "presentation_id": request.presentation_id
        }).sort("created_at", -1).limit(10).to_list(10)
        
        chat_history.reverse()  # Chronological order
        
        # Build context-aware system prompt
        system_prompt = f"""You are an AI presentation assistant helping with a presentation titled "{presentation.get('title', 'Untitled')}".

Your role is to:
1. Suggest better wording and structure for slide content
2. Recommend visual elements and design improvements
3. Provide content ideas and expand on topics
4. Offer design tips and best practices
5. Answer questions about presentation creation

Keep responses concise, actionable, and friendly.
"""
        
        # Add current slide context if available
        if request.context and request.context.slide_title:
            system_prompt += f"\n\nCurrent slide context:"
            system_prompt += f"\n- Slide #{request.context.slide_number}: {request.context.slide_title}"
            if request.context.slide_content:
                system_prompt += f"\n- Content: {request.context.slide_content[:200]}..."
        
        # Build conversation context from history
        conversation_context = ""
        if len(chat_history) > 1:
            conversation_context = "\n\nRecent conversation:\n"
            for msg in chat_history[-6:]:  # Last 3 exchanges
                role = "User" if msg['role'] == 'user' else "Assistant"
                conversation_context += f"{role}: {msg['content'][:100]}...\n"
        
        # Generate AI response
        full_prompt = f"{conversation_context}\n\nUser: {request.message}\n\nProvide helpful, specific advice:"
        
        ai_response = await gemini_service.generate_text(
            prompt=full_prompt,
            system_message=system_prompt,
            session_id=f"chat-{request.presentation_id}"
        )
        
        # Save assistant message
        assistant_message = ChatMessage(
            presentation_id=request.presentation_id,
            user_id=user_id,
            role="assistant",
            content=ai_response,
            context=request.context
        )
        
        await db.chat_messages.insert_one(assistant_message.model_dump())
        
        return {
            "success": True,
            "data": {
                "user_message": ChatMessageResponse(**user_message.model_dump()),
                "assistant_message": ChatMessageResponse(**assistant_message.model_dump())
            },
            "message": "Chat message sent successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process chat message: {str(e)}"
        )

@router.get("/chat-history/{presentation_id}", response_model=List[ChatMessageResponse])
async def get_chat_history(
    presentation_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get chat history for a presentation
    """
    try:
        user_id = current_user['id']
        
        # Verify user owns this presentation
        presentation = await db.presentations.find_one({
            "id": presentation_id,
            "user_id": user_id
        })
        
        if not presentation:
            raise HTTPException(status_code=404, detail="Presentation not found")
        
        # Get all chat messages
        messages = await db.chat_messages.find({
            "presentation_id": presentation_id
        }).sort("created_at", 1).to_list(1000)
        
        return [ChatMessageResponse(**msg) for msg in messages]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching chat history: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch chat history: {str(e)}"
        )

@router.post("/apply-suggestion")
async def apply_suggestion(
    request: ApplySuggestionRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Apply AI suggestion to a slide
    
    This endpoint applies suggestions like:
    - Content improvements (text changes)
    - Layout changes (element positioning)
    - Style updates (colors, fonts)
    """
    try:
        user_id = current_user['id']
        
        # Get the slide
        slide = await db.slides.find_one({"id": request.slide_id})
        
        if not slide:
            raise HTTPException(status_code=404, detail="Slide not found")
        
        # Verify ownership
        presentation = await db.presentations.find_one({
            "id": slide['presentation_id'],
            "user_id": user_id
        })
        
        if not presentation:
            raise HTTPException(status_code=403, detail="Unauthorized")
        
        # Apply suggestion based on type
        if request.suggestion_type == "content":
            # Update slide elements with new content
            if "elements" in request.suggestion_data:
                slide['elements'] = request.suggestion_data['elements']
        
        elif request.suggestion_type == "layout":
            # Update element positions
            if "layout_updates" in request.suggestion_data:
                for update in request.suggestion_data['layout_updates']:
                    element_id = update.get('element_id')
                    for element in slide.get('elements', []):
                        if element.get('id') == element_id:
                            element['position'].update(update.get('position', {}))
        
        elif request.suggestion_type == "style":
            # Update styles
            if "style_updates" in request.suggestion_data:
                for update in request.suggestion_data['style_updates']:
                    element_id = update.get('element_id')
                    for element in slide.get('elements', []):
                        if element.get('id') == element_id:
                            element['style'].update(update.get('style', {}))
        
        # Save updated slide
        await db.slides.update_one(
            {"id": request.slide_id},
            {"$set": slide}
        )
        
        return {
            "success": True,
            "message": "Suggestion applied successfully",
            "data": slide
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error applying suggestion: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to apply suggestion: {str(e)}"
        )
