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
    \"\"\"Request to apply template to presentation\"\"\"
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
    
    return TemplateResponse(**template)