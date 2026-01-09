from fastapi import APIRouter, Depends
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime

from models.template import Template, TemplateResponse
from routes.auth import get_db
from utils.auth_utils import get_current_user
from pydantic import BaseModel, Field
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

class ApplyTemplateRequest(BaseModel):
    """Request to apply template to presentation"""
    presentation_id: str
    template_id: str
    color_scheme: Dict[str, str]
    font_pairing: Dict[str, str]


router = APIRouter(prefix="/templates", tags=["Templates"])

@router.get("", response_model=List[TemplateResponse])
async def list_templates(
    category: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """List all available templates"""
    query = {}
    if category:
        query["category"] = category
    
    templates = await db.templates.find(query, {"_id": 0}).to_list(1000)
    
    # Convert ISO strings to datetime
    for template in templates:
        if isinstance(template.get('created_at'), str):
            template['created_at'] = datetime.fromisoformat(template['created_at'])
    
    return templates

@router.get("/categories")
async def get_categories(db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get all template categories"""
    categories = await db.templates.distinct("category")
    return {"categories": categories}

@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(
    template_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get a single template"""
    template = await db.templates.find_one({"id": template_id}, {"_id": 0})
    
    if not template:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Convert ISO strings to datetime
    if isinstance(template.get('created_at'), str):
        template['created_at'] = datetime.fromisoformat(template['created_at'])


@router.post("/apply")
async def apply_template(
    request: ApplyTemplateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Apply template styling to an existing presentation
    
    This updates all slides with:
    - New color scheme
    - New font pairing
    - Template background styles
    """
    try:
        user_id = current_user['id']
        
        # Verify user owns the presentation
        presentation = await db.presentations.find_one({
            "id": request.presentation_id,
            "user_id": user_id
        })
        
        if not presentation:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Presentation not found")
        
        # Get all slides for this presentation
        slides = await db.slides.find({
            "presentation_id": request.presentation_id
        }).to_list(1000)
        
        # Apply template to each slide
        for slide in slides:
            # Update background color
            if not slide.get('background'):
                slide['background'] = {}
            slide['background']['color'] = request.color_scheme.get('background', '#FFFFFF')
            
            # Update elements
            if slide.get('elements'):
                for element in slide['elements']:
                    if element['type'] == 'text':
                        # Apply font pairing
                        is_heading = element.get('style', {}).get('font_size', 16) > 30
                        element['style']['font_family'] = request.font_pairing.get(
                            'heading' if is_heading else 'body', 
                            'Inter'
                        )
                        element['style']['color'] = request.color_scheme.get('text', '#000000')
                    
                    elif element['type'] == 'shape':
                        # Apply color scheme to shapes
                        element['style']['fill_color'] = request.color_scheme.get('primary', '#3B82F6')
                        element['style']['stroke_color'] = request.color_scheme.get('secondary', '#1E40AF')
            
            # Save updated slide
            await db.slides.update_one(
                {"id": slide['id']},
                {"$set": slide}
            )
        
        # Update presentation template reference
        await db.presentations.update_one(
            {"id": request.presentation_id},
            {"$set": {"template": request.template_id}}
        )
        
        logger.info(f"Template {request.template_id} applied to presentation {request.presentation_id}")
        
        return {
            "success": True,
            "message": f"Template applied to {len(slides)} slides",
            "data": {
                "slides_updated": len(slides),
                "template_id": request.template_id
            }
        }
        
    except Exception as e:
        logger.error(f"Error applying template: {str(e)}")
        from fastapi import HTTPException
        raise HTTPException(
            status_code=500,
            detail=f"Failed to apply template: {str(e)}"
        )

    
    return TemplateResponse(**template)