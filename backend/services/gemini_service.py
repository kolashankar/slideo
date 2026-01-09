import os
import asyncio
import logging
from typing import List, Dict, Any, Tuple, Optional
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
import base64

logger = logging.getLogger(__name__)

class GeminiService:
    """Service for interacting with Gemini AI models via emergentintegrations"""
    
    def __init__(self):
        self.api_key = os.getenv("EMERGENT_LLM_KEY")
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY not found in environment variables")
    
    async def generate_text(
        self,
        prompt: str,
        system_message: str = "You are a helpful AI assistant.",
        session_id: Optional[str] = None,
        model: str = "gemini-3-flash-preview"
    ) -> str:
        """
        Generate text using Gemini model
        
        Args:
            prompt: User prompt for text generation
            system_message: System message to set context
            session_id: Unique session ID for chat context
            model: Gemini model to use
            
        Returns:
            Generated text response
        """
        try:
            # Create a new chat instance for each request
            chat = LlmChat(
                api_key=self.api_key,
                session_id=session_id or f"text-{asyncio.current_task().get_name()}",
                system_message=system_message
            )
            
            # Configure model
            chat.with_model("gemini", model)
            
            # Create user message
            user_message = UserMessage(text=prompt)
            
            # Send message and get response
            response = await chat.send_message(user_message)
            
            logger.info(f"Text generation successful. Response length: {len(response)} chars")
            return response
            
        except Exception as e:
            logger.error(f"Error generating text: {str(e)}")
            raise Exception(f"Failed to generate text: {str(e)}")
    
    async def generate_image(
        self,
        prompt: str,
        system_message: str = "You are a helpful AI assistant for image generation.",
        session_id: Optional[str] = None,
        model: str = "gemini-3-pro-image-preview",
        reference_image: Optional[str] = None
    ) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Generate image using Gemini Nano Banana model
        
        Args:
            prompt: User prompt for image generation
            system_message: System message to set context
            session_id: Unique session ID
            model: Gemini image model to use (default: gemini-3-pro-image-preview)
            reference_image: Optional base64-encoded reference image
            
        Returns:
            Tuple of (text_response, list of image dicts with 'data' and 'mime_type')
        """
        try:
            # Create a new chat instance
            chat = LlmChat(
                api_key=self.api_key,
                session_id=session_id or f"image-{asyncio.current_task().get_name()}",
                system_message=system_message
            )
            
            # Configure model with multimodal params
            chat.with_model("gemini", model).with_params(modalities=["image", "text"])
            
            # Create user message with optional reference image
            file_contents = None
            if reference_image:
                file_contents = [ImageContent(reference_image)]
            
            user_message = UserMessage(
                text=prompt,
                file_contents=file_contents
            )
            
            # Send message and get multimodal response
            text, images = await chat.send_message_multimodal_response(user_message)
            
            if images:
                logger.info(f"Image generation successful. Generated {len(images)} image(s)")
            else:
                logger.warning("No images generated")
            
            return text, images or []
            
        except Exception as e:
            logger.error(f"Error generating image: {str(e)}")
            raise Exception(f"Failed to generate image: {str(e)}")
    
    async def generate_structured_content(
        self,
        prompt: str,
        system_message: str,
        session_id: Optional[str] = None
    ) -> str:
        """
        Generate structured content (like JSON) using Gemini
        
        Args:
            prompt: User prompt requesting structured output
            system_message: System message with format instructions
            session_id: Unique session ID
            
        Returns:
            Structured text response
        """
        return await self.generate_text(
            prompt=prompt,
            system_message=system_message,
            session_id=session_id
        )