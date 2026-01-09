from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone

from models.presentation import (
    Presentation, 
    PresentationCreate, 
    PresentationUpdate, 
    PresentationResponse
)
from models.user import User
from routes.auth import get_current_user, get_db

router = APIRouter(prefix="/presentations", tags=["Presentations"])

@router.get("", response_model=List[PresentationResponse])
async def list_presentations(
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """List all presentations for current user"""
    query = {"user_id": current_user.id}
    
    # Add search filter if provided
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    presentations = await db.presentations.find(query, {"_id": 0}).sort("updated_at", -1).to_list(1000)
    
    # Convert ISO strings to datetime
    for pres in presentations:
        if isinstance(pres.get('created_at'), str):
            pres['created_at'] = datetime.fromisoformat(pres['created_at'])
        if isinstance(pres.get('updated_at'), str):
            pres['updated_at'] = datetime.fromisoformat(pres['updated_at'])
    
    return presentations

@router.post("", response_model=PresentationResponse)
async def create_presentation(
    presentation_data: PresentationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a new presentation"""
    presentation = Presentation(
        user_id=current_user.id,
        title=presentation_data.title,
        description=presentation_data.description,
        template_id=presentation_data.template_id
    )
    
    # Convert to dict and serialize datetimes
    pres_dict = presentation.model_dump()
    pres_dict['created_at'] = pres_dict['created_at'].isoformat()
    pres_dict['updated_at'] = pres_dict['updated_at'].isoformat()
    
    await db.presentations.insert_one(pres_dict)
    
    return PresentationResponse(**presentation.model_dump())

@router.get("/{presentation_id}", response_model=PresentationResponse)
async def get_presentation(
    presentation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get a single presentation"""
    presentation = await db.presentations.find_one(
        {"id": presentation_id, "user_id": current_user.id},
        {"_id": 0}
    )
    
    if not presentation:
        raise HTTPException(status_code=404, detail="Presentation not found")
    
    # Convert ISO strings to datetime
    if isinstance(presentation.get('created_at'), str):
        presentation['created_at'] = datetime.fromisoformat(presentation['created_at'])
    if isinstance(presentation.get('updated_at'), str):
        presentation['updated_at'] = datetime.fromisoformat(presentation['updated_at'])
    
    return PresentationResponse(**presentation)

@router.put("/{presentation_id}", response_model=PresentationResponse)
async def update_presentation(
    presentation_id: str,
    update_data: PresentationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update a presentation"""
    # Check if presentation exists and belongs to user
    existing = await db.presentations.find_one(
        {"id": presentation_id, "user_id": current_user.id}
    )
    
    if not existing:
        raise HTTPException(status_code=404, detail="Presentation not found")
    
    # Prepare update data
    update_dict = {k: v for k, v in update_data.model_dump(exclude_unset=True).items()}
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    # Update in database
    await db.presentations.update_one(
        {"id": presentation_id},
        {"$set": update_dict}
    )
    
    # Fetch updated presentation
    updated = await db.presentations.find_one(
        {"id": presentation_id},
        {"_id": 0}
    )
    
    # Convert ISO strings to datetime
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    
    return PresentationResponse(**updated)

@router.delete("/{presentation_id}")
async def delete_presentation(
    presentation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Delete a presentation"""
    result = await db.presentations.delete_one(
        {"id": presentation_id, "user_id": current_user.id}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Presentation not found")
    
    return {"message": "Presentation deleted successfully"}

@router.post("/from-ai", response_model=PresentationResponse)
async def create_presentation_from_ai(
    ai_data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Create a presentation from AI-generated data
    
    This endpoint takes the raw AI output and converts it into a proper presentation
    with slides and elements positioned correctly.
    """
    try:
        import uuid
        from models.slide import Slide, SlideElement, ElementPosition, SlideBackground
        
        # Extract presentation data
        title = ai_data.get('title', 'Untitled Presentation')
        description = ai_data.get('description', '')
        ai_slides = ai_data.get('slides', [])
        
        if not ai_slides:
            raise HTTPException(status_code=400, detail="No slides provided in AI data")
        
        # Create presentation
        presentation = Presentation(
            user_id=current_user.id,
            title=title,
            description=description,
            template_id=None
        )
        
        # Convert to dict and serialize datetimes
        pres_dict = presentation.model_dump()
        pres_dict['created_at'] = pres_dict['created_at'].isoformat()
        pres_dict['updated_at'] = pres_dict['updated_at'].isoformat()
        
        # Insert presentation
        await db.presentations.insert_one(pres_dict)
        
        # Create slides from AI data
        slide_ids = []
        for idx, ai_slide in enumerate(ai_slides, 1):
            # Determine layout
            layout = ai_slide.get('layout', 'content')
            if idx == 1:
                layout = 'title-slide'
            elif idx == len(ai_slides):
                layout = 'conclusion'
            
            # Create elements from AI content
            elements = []
            
            # Title element
            slide_title = ai_slide.get('title', f'Slide {idx}')
            title_element = SlideElement(
                type='text',
                position=ElementPosition(
                    x=10, y=10, width=80, height=15, z_index=1
                ),
                content={'text': slide_title},
                style={
                    'font_family': 'Inter',
                    'font_size': 32 if layout == 'title-slide' else 24,
                    'font_weight': 700,
                    'color': '#1a202c',
                    'align': 'left'
                }
            )
            elements.append(title_element.model_dump())
            
            # Content element
            slide_content = ai_slide.get('content', '')
            if slide_content:
                content_element = SlideElement(
                    type='text',
                    position=ElementPosition(
                        x=10, y=30, width=80, height=60, z_index=1
                    ),
                    content={'text': slide_content},
                    style={
                        'font_family': 'Inter',
                        'font_size': 18,
                        'font_weight': 400,
                        'color': '#2d3748',
                        'align': 'left',
                        'line_height': 1.6
                    }
                )
                elements.append(content_element.model_dump())
            
            # Create slide
            slide = Slide(
                presentation_id=presentation.id,
                slide_number=idx,
                title=slide_title,
                layout=layout,
                elements=elements,
                background=SlideBackground(type='solid', color='#FFFFFF'),
                notes=ai_slide.get('speaker_notes', '')
            )
            
            # Insert slide
            slide_dict = slide.model_dump()
            slide_dict['created_at'] = slide_dict['created_at'].isoformat()
            slide_dict['updated_at'] = slide_dict['updated_at'].isoformat()
            await db.slides.insert_one(slide_dict)
            
            slide_ids.append(slide.id)
        
        # Update presentation with slide IDs
        await db.presentations.update_one(
            {"id": presentation.id},
            {"$set": {"slides": slide_ids}}
        )
        
        return PresentationResponse(**presentation.model_dump())
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating presentation from AI: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create presentation: {str(e)}")
