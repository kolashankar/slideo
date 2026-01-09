import json
import logging
from typing import List, Dict, Any, Optional
from services.gemini_service import GeminiService
import uuid

logger = logging.getLogger(__name__)

class PresentationGenerator:
    """Service for generating presentation content using AI"""
    
    def __init__(self):
        self.gemini_service = GeminiService()
    
    async def generate_presentation(
        self,
        topic: str,
        audience: str = "general",
        tone: str = "professional",
        slide_count: int = 10,
        additional_context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a complete presentation from a topic
        
        Args:
            topic: Main topic of the presentation
            audience: Target audience (general, business, educational, technical)
            tone: Presentation tone (professional, casual, educational, inspirational)
            slide_count: Desired number of slides (5-15)
            additional_context: Optional additional context or requirements
            
        Returns:
            Dictionary with presentation structure and content
        """
        try:
            # Validate slide count
            slide_count = max(5, min(15, slide_count))
            
            # Build system message
            system_message = """You are an expert presentation designer. Create professional presentations with clear structure and engaging content.

You must respond with ONLY valid JSON in the following format:
{
  "title": "Presentation Title",
  "description": "Brief description",
  "slides": [
    {
      "slide_number": 1,
      "title": "Slide Title",
      "content": "Main content with key points",
      "layout": "title-slide|content|image-text|conclusion",
      "speaker_notes": "Notes for presenter",
      "visual_suggestion": "Description of suggested visual/image"
    }
  ]
}

Guidelines:
1. Create engaging, clear slide titles (5-8 words)
2. Use bullet points or short paragraphs for content
3. First slide should be a title slide with the presentation title
4. Last slide should be a conclusion or thank you slide
5. Middle slides should cover key topics logically
6. Each slide should have 3-5 key points or 2-3 short paragraphs
7. Suggest appropriate visuals for each slide
8. Keep language clear and audience-appropriate"""
            
            # Build user prompt
            context_part = f"\n\nAdditional context: {additional_context}" if additional_context else ""
            
            user_prompt = f"""Create a {slide_count}-slide presentation about: {topic}

Target audience: {audience}
Presentation tone: {tone}
Number of slides: {slide_count}{context_part}

Provide the complete presentation structure as JSON."""
            
            # Generate presentation
            session_id = f"pres-gen-{uuid.uuid4()}"
            response = await self.gemini_service.generate_text(
                prompt=user_prompt,
                system_message=system_message,
                session_id=session_id
            )
            
            # Parse JSON response
            try:
                # Clean response - remove markdown code blocks if present
                cleaned_response = response.strip()
                if cleaned_response.startswith("```json"):
                    cleaned_response = cleaned_response[7:]
                if cleaned_response.startswith("```"):
                    cleaned_response = cleaned_response[3:]
                if cleaned_response.endswith("```"):
                    cleaned_response = cleaned_response[:-3]
                cleaned_response = cleaned_response.strip()
                
                presentation_data = json.loads(cleaned_response)
                logger.info(f"Successfully generated presentation with {len(presentation_data.get('slides', []))} slides")
                return presentation_data
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON response: {str(e)}")
                logger.error(f"Response: {response[:500]}...")
                raise Exception("Failed to parse AI response as JSON")
                
        except Exception as e:
            logger.error(f"Error generating presentation: {str(e)}")
            raise
    
    async def generate_outline(
        self,
        topic: str,
        slide_count: int = 10
    ) -> Dict[str, Any]:
        """
        Generate a presentation outline (structure only)
        
        Args:
            topic: Main topic
            slide_count: Number of slides
            
        Returns:
            Outline structure with slide titles and brief descriptions
        """
        try:
            slide_count = max(5, min(15, slide_count))
            
            system_message = """You are a presentation structure expert. Create clear, logical outlines.

Respond with ONLY valid JSON:
{
  "topic": "Main topic",
  "outline": [
    {
      "slide_number": 1,
      "title": "Slide Title",
      "description": "What this slide will cover",
      "layout": "title-slide|content|conclusion"
    }
  ]
}"""
            
            user_prompt = f"""Create a {slide_count}-slide outline for a presentation about: {topic}

Provide slide titles and brief descriptions for each slide."""
            
            session_id = f"outline-{uuid.uuid4()}"
            response = await self.gemini_service.generate_text(
                prompt=user_prompt,
                system_message=system_message,
                session_id=session_id
            )
            
            # Parse JSON
            cleaned_response = response.strip()
            if cleaned_response.startswith("```json"):
                cleaned_response = cleaned_response[7:]
            if cleaned_response.startswith("```"):
                cleaned_response = cleaned_response[3:]
            if cleaned_response.endswith("```"):
                cleaned_response = cleaned_response[:-3]
            cleaned_response = cleaned_response.strip()
            
            outline_data = json.loads(cleaned_response)
            logger.info(f"Successfully generated outline with {len(outline_data.get('outline', []))} slides")
            return outline_data
            
        except Exception as e:
            logger.error(f"Error generating outline: {str(e)}")
            raise
    
    async def generate_slide_content(
        self,
        slide_title: str,
        presentation_context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate content for a single slide
        
        Args:
            slide_title: Title of the slide
            presentation_context: Context about the presentation
            
        Returns:
            Slide content dictionary
        """
        try:
            system_message = """You are a presentation content expert. Create engaging slide content.

Respond with ONLY valid JSON:
{
  "title": "Slide Title",
  "content": "Main content with key points",
  "speaker_notes": "Presenter notes",
  "visual_suggestion": "Suggested visual"
}"""
            
            context_part = f"\nPresentation context: {presentation_context}" if presentation_context else ""
            
            user_prompt = f"""Create content for a slide titled: {slide_title}{context_part}

Provide 3-5 key points or 2-3 short paragraphs."""
            
            session_id = f"slide-{uuid.uuid4()}"
            response = await self.gemini_service.generate_text(
                prompt=user_prompt,
                system_message=system_message,
                session_id=session_id
            )
            
            # Parse JSON
            cleaned_response = response.strip()
            if cleaned_response.startswith("```json"):
                cleaned_response = cleaned_response[7:]
            if cleaned_response.startswith("```"):
                cleaned_response = cleaned_response[3:]
            if cleaned_response.endswith("```"):
                cleaned_response = cleaned_response[:-3]
            cleaned_response = cleaned_response.strip()
            
            slide_data = json.loads(cleaned_response)
            logger.info("Successfully generated slide content")
            return slide_data
            
        except Exception as e:
            logger.error(f"Error generating slide content: {str(e)}")
            raise
    
    async def improve_content(
        self,
        current_content: str,
        improvement_type: str = "general",
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Improve existing slide content
        
        Args:
            current_content: Current slide content
            improvement_type: Type of improvement (general, clarity, engagement, conciseness)
            context: Additional context
            
        Returns:
            Improved content dictionary
        """
        try:
            improvement_instructions = {
                "general": "Make the content more professional and engaging",
                "clarity": "Improve clarity and make the message clearer",
                "engagement": "Make the content more engaging and impactful",
                "conciseness": "Make the content more concise while retaining key information"
            }
            
            instruction = improvement_instructions.get(improvement_type, improvement_instructions["general"])
            
            system_message = f"""You are a presentation improvement expert. {instruction}.

Respond with ONLY valid JSON:
{{
  "improved_content": "The improved content",
  "changes_made": "Brief description of changes",
  "suggestions": "Additional suggestions"
}}"""
            
            context_part = f"\nContext: {context}" if context else ""
            
            user_prompt = f"""Improve this slide content:

{current_content}{context_part}

Provide improved version."""
            
            session_id = f"improve-{uuid.uuid4()}"
            response = await self.gemini_service.generate_text(
                prompt=user_prompt,
                system_message=system_message,
                session_id=session_id
            )
            
            # Parse JSON
            cleaned_response = response.strip()
            if cleaned_response.startswith("```json"):
                cleaned_response = cleaned_response[7:]
            if cleaned_response.startswith("```"):
                cleaned_response = cleaned_response[3:]
            if cleaned_response.endswith("```"):
                cleaned_response = cleaned_response[:-3]
            cleaned_response = cleaned_response.strip()
            
            improved_data = json.loads(cleaned_response)
            logger.info("Successfully improved content")
            return improved_data
            
        except Exception as e:
            logger.error(f"Error improving content: {str(e)}")
            raise