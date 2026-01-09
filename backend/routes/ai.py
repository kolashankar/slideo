from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from services.presentation_generator import PresentationGenerator
from services.gemini_service import GeminiService
from utils.auth_utils import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["AI Generation"])

# Initialize services
presentation_generator = PresentationGenerator()
gemini_service = GeminiService()

# Request/Response Models
class GeneratePresentationRequest(BaseModel):
    topic: str = Field(..., min_length=3, max_length=500, description="Main topic of the presentation")
    audience: str = Field(default="general", description="Target audience")
    tone: str = Field(default="professional", description="Presentation tone")
    slide_count: int = Field(default=10, ge=5, le=15, description="Number of slides to generate")
    additional_context: Optional[str] = Field(None, max_length=1000, description="Additional context or requirements")

class GenerateOutlineRequest(BaseModel):
    topic: str = Field(..., min_length=3, max_length=500, description="Main topic")
    slide_count: int = Field(default=10, ge=5, le=15, description="Number of slides")

class GenerateSlideContentRequest(BaseModel):
    slide_title: str = Field(..., min_length=3, max_length=200, description="Title of the slide")
    presentation_context: Optional[str] = Field(None, max_length=500, description="Context about the presentation")

class ImproveContentRequest(BaseModel):
    current_content: str = Field(..., min_length=10, max_length=5000, description="Current slide content")
    improvement_type: str = Field(default="general", description="Type of improvement")
    context: Optional[str] = Field(None, max_length=500, description="Additional context")

class GenerateImageRequest(BaseModel):
    prompt: str = Field(..., min_length=10, max_length=1000, description="Image generation prompt")
    style: str = Field(default="professional", description="Image style")
    reference_image: Optional[str] = Field(None, description="Base64-encoded reference image")

# Endpoints
@router.post("/generate-presentation")
async def generate_presentation(
    request: GeneratePresentationRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a complete presentation from a topic using AI
    
    This endpoint uses Gemini 3 Flash to create a full presentation with:
    - Title slide
    - Content slides (5-15 slides)
    - Conclusion slide
    - Speaker notes
    - Visual suggestions
    """
    try:
        logger.info(f"User {current_user['email']} generating presentation for topic: {request.topic}")
        
        # Generate presentation
        presentation_data = await presentation_generator.generate_presentation(
            topic=request.topic,
            audience=request.audience,
            tone=request.tone,
            slide_count=request.slide_count,
            additional_context=request.additional_context
        )
        
        return {
            "success": True,
            "data": presentation_data,
            "message": "Presentation generated successfully"
        }
        
    except Exception as e:
        logger.error(f"Error generating presentation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate presentation: {str(e)}"
        )

@router.post("/generate-outline")
async def generate_outline(
    request: GenerateOutlineRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a presentation outline (structure only) from a topic
    
    Returns slide titles and descriptions without full content
    """
    try:
        logger.info(f"User {current_user['email']} generating outline for: {request.topic}")
        
        # Generate outline
        outline_data = await presentation_generator.generate_outline(
            topic=request.topic,
            slide_count=request.slide_count
        )
        
        return {
            "success": True,
            "data": outline_data,
            "message": "Outline generated successfully"
        }
        
    except Exception as e:
        logger.error(f"Error generating outline: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate outline: {str(e)}"
        )

@router.post("/generate-slide-content")
async def generate_slide_content(
    request: GenerateSlideContentRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate content for a single slide
    
    Useful for adding new slides or regenerating content for existing slides
    """
    try:
        logger.info(f"User {current_user['email']} generating content for slide: {request.slide_title}")
        
        # Generate slide content
        slide_data = await presentation_generator.generate_slide_content(
            slide_title=request.slide_title,
            presentation_context=request.presentation_context
        )
        
        return {
            "success": True,
            "data": slide_data,
            "message": "Slide content generated successfully"
        }
        
    except Exception as e:
        logger.error(f"Error generating slide content: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate slide content: {str(e)}"
        )

@router.post("/improve-content")
async def improve_content(
    request: ImproveContentRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Improve existing slide content
    
    Improvement types:
    - general: Overall improvement
    - clarity: Improve clarity
    - engagement: Make more engaging
    - conciseness: Make more concise
    """
    try:
        logger.info(f"User {current_user['email']} improving content (type: {request.improvement_type})")
        
        # Improve content
        improved_data = await presentation_generator.improve_content(
            current_content=request.current_content,
            improvement_type=request.improvement_type,
            context=request.context
        )
        
        return {
            "success": True,
            "data": improved_data,
            "message": "Content improved successfully"
        }
        
    except Exception as e:
        logger.error(f"Error improving content: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to improve content: {str(e)}"
        )

@router.post("/generate-image")
async def generate_image(
    request: GenerateImageRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate an image using Gemini Nano Banana
    
    Returns base64-encoded image data
    """
    try:
        logger.info(f"User {current_user['email']} generating image with prompt: {request.prompt[:50]}...")
        
        # Enhance prompt with style
        enhanced_prompt = f"{request.prompt}\n\nStyle: {request.style}, high-quality, professional"
        
        # Generate image
        text_response, images = await gemini_service.generate_image(
            prompt=enhanced_prompt,
            reference_image=request.reference_image
        )
        
        if not images:
            raise HTTPException(
                status_code=500,
                detail="No images were generated"
            )
        
        # Return first image
        image_data = images[0]
        
        return {
            "success": True,
            "data": {
                "image_base64": image_data.get('data'),
                "mime_type": image_data.get('mime_type', 'image/png'),
                "text_response": text_response
            },
            "message": "Image generated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating image: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate image: {str(e)}"
        )

@router.get("/health")
async def ai_health_check():
    """Check if AI services are configured correctly"""
    try:
        # Try to initialize services
        gemini_service = GeminiService()
        return {
            "success": True,
            "message": "AI services configured correctly",
            "services": {
                "gemini_text": "available",
                "gemini_image": "available"
            }
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"AI services configuration error: {str(e)}",
            "services": {
                "gemini_text": "unavailable",
                "gemini_image": "unavailable"
            }
        }