from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from models.slide import (
    Slide, CreateSlideRequest, UpdateSlideRequest,
    ReorderSlidesRequest, AddElementRequest,
    UpdateElementRequest, DeleteElementRequest
)
from utils.auth_utils import get_current_user
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/slides", tags=["Slides"])

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
slides_collection = db['slides']
presentations_collection = db['presentations']

@router.get("/presentations/{presentation_id}/slides")
async def get_presentation_slides(
    presentation_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get all slides for a presentation
    
    Returns slides ordered by slide_number
    """
    try:
        # Verify presentation belongs to user
        presentation = await presentations_collection.find_one({
            "id": presentation_id,
            "user_id": current_user["id"]
        })
        
        if not presentation:
            raise HTTPException(status_code=404, detail="Presentation not found")
        
        # Get all slides for this presentation
        slides = await slides_collection.find({
            "presentation_id": presentation_id
        }).sort("slide_number", 1).to_list(length=100)
        
        return {
            "success": True,
            "data": slides,
            "count": len(slides)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching slides: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/presentations/{presentation_id}/slides")
async def create_slide(
    presentation_id: str,
    request: CreateSlideRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new slide in a presentation
    """
    try:
        # Verify presentation belongs to user
        presentation = await presentations_collection.find_one({
            "id": presentation_id,
            "user_id": current_user["id"]
        })
        
        if not presentation:
            raise HTTPException(status_code=404, detail="Presentation not found")
        
        # Create slide object
        slide = Slide(
            presentation_id=presentation_id,
            slide_number=request.slide_number,
            title=request.title,
            layout=request.layout
        )
        
        # Insert into database
        slide_dict = slide.model_dump()
        await slides_collection.insert_one(slide_dict)
        
        # Update presentation's slides array
        await presentations_collection.update_one(
            {"id": presentation_id},
            {
                "$push": {"slides": slide.id},
                "$set": {"updated_at": datetime.now()}
            }
        )
        
        logger.info(f"Created slide {slide.id} in presentation {presentation_id}")
        
        return {
            "success": True,
            "data": slide_dict,
            "message": "Slide created successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating slide: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/slides/{slide_id}")
async def get_slide(
    slide_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a single slide by ID
    """
    try:
        # Get slide
        slide = await slides_collection.find_one({"id": slide_id})
        
        if not slide:
            raise HTTPException(status_code=404, detail="Slide not found")
        
        # Verify user owns the presentation
        presentation = await presentations_collection.find_one({
            "id": slide["presentation_id"],
            "user_id": current_user["id"]
        })
        
        if not presentation:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return {
            "success": True,
            "data": slide
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching slide: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/slides/{slide_id}")
async def update_slide(
    slide_id: str,
    request: UpdateSlideRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Update a slide
    """
    try:
        # Get slide
        slide = await slides_collection.find_one({"id": slide_id})
        
        if not slide:
            raise HTTPException(status_code=404, detail="Slide not found")
        
        # Verify user owns the presentation
        presentation = await presentations_collection.find_one({
            "id": slide["presentation_id"],
            "user_id": current_user["id"]
        })
        
        if not presentation:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Build update dict
        update_data = {"updated_at": datetime.now()}
        
        if request.title is not None:
            update_data["title"] = request.title
        if request.layout is not None:
            update_data["layout"] = request.layout
        if request.elements is not None:
            update_data["elements"] = [elem.model_dump() for elem in request.elements]
        if request.background is not None:
            update_data["background"] = request.background.model_dump()
        if request.notes is not None:
            update_data["notes"] = request.notes
        if request.duration is not None:
            update_data["duration"] = request.duration
        if request.transition is not None:
            update_data["transition"] = request.transition
        
        # Update slide
        await slides_collection.update_one(
            {"id": slide_id},
            {"$set": update_data}
        )
        
        # Update presentation timestamp
        await presentations_collection.update_one(
            {"id": slide["presentation_id"]},
            {"$set": {"updated_at": datetime.now()}}
        )
        
        # Get updated slide
        updated_slide = await slides_collection.find_one({"id": slide_id})
        
        logger.info(f"Updated slide {slide_id}")
        
        return {
            "success": True,
            "data": updated_slide,
            "message": "Slide updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating slide: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/slides/{slide_id}")
async def delete_slide(
    slide_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a slide
    """
    try:
        # Get slide
        slide = await slides_collection.find_one({"id": slide_id})
        
        if not slide:
            raise HTTPException(status_code=404, detail="Slide not found")
        
        # Verify user owns the presentation
        presentation = await presentations_collection.find_one({
            "id": slide["presentation_id"],
            "user_id": current_user["id"]
        })
        
        if not presentation:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Delete slide
        await slides_collection.delete_one({"id": slide_id})
        
        # Remove from presentation's slides array
        await presentations_collection.update_one(
            {"id": slide["presentation_id"]},
            {
                "$pull": {"slides": slide_id},
                "$set": {"updated_at": datetime.now()}
            }
        )
        
        # Reorder remaining slides
        remaining_slides = await slides_collection.find({
            "presentation_id": slide["presentation_id"],
            "slide_number": {"$gt": slide["slide_number"]}
        }).to_list(length=100)
        
        for s in remaining_slides:
            await slides_collection.update_one(
                {"id": s["id"]},
                {"$set": {"slide_number": s["slide_number"] - 1}}
            )
        
        logger.info(f"Deleted slide {slide_id}")
        
        return {
            "success": True,
            "message": "Slide deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting slide: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/slides/{slide_id}/duplicate")
async def duplicate_slide(
    slide_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Duplicate a slide
    """
    try:
        # Get slide
        slide = await slides_collection.find_one({"id": slide_id})
        
        if not slide:
            raise HTTPException(status_code=404, detail="Slide not found")
        
        # Verify user owns the presentation
        presentation = await presentations_collection.find_one({
            "id": slide["presentation_id"],
            "user_id": current_user["id"]
        })
        
        if not presentation:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Create duplicate
        import uuid
        new_slide = Slide(**{
            **slide,
            "id": str(uuid.uuid4()),
            "slide_number": slide["slide_number"] + 1,
            "title": f"{slide['title']} (Copy)",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        })
        
        # Shift slides after this position
        await slides_collection.update_many(
            {
                "presentation_id": slide["presentation_id"],
                "slide_number": {"$gt": slide["slide_number"]}
            },
            {"$inc": {"slide_number": 1}}
        )
        
        # Insert duplicate
        new_slide_dict = new_slide.model_dump()
        await slides_collection.insert_one(new_slide_dict)
        
        # Update presentation
        await presentations_collection.update_one(
            {"id": slide["presentation_id"]},
            {
                "$push": {"slides": new_slide.id},
                "$set": {"updated_at": datetime.now()}
            }
        )
        
        logger.info(f"Duplicated slide {slide_id} to {new_slide.id}")
        
        return {
            "success": True,
            "data": new_slide_dict,
            "message": "Slide duplicated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error duplicating slide: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/slides/reorder")
async def reorder_slides(
    request: ReorderSlidesRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Reorder slides in a presentation
    """
    try:
        # Get slide
        slide = await slides_collection.find_one({"id": request.slide_id})
        
        if not slide:
            raise HTTPException(status_code=404, detail="Slide not found")
        
        # Verify user owns the presentation
        presentation = await presentations_collection.find_one({
            "id": slide["presentation_id"],
            "user_id": current_user["id"]
        })
        
        if not presentation:
            raise HTTPException(status_code=403, detail="Access denied")
        
        old_position = slide["slide_number"]
        new_position = request.new_position
        
        if old_position == new_position:
            return {
                "success": True,
                "message": "No change in position"
            }
        
        # Update slide positions
        if new_position < old_position:
            # Moving up - shift slides down
            await slides_collection.update_many(
                {
                    "presentation_id": slide["presentation_id"],
                    "slide_number": {"$gte": new_position, "$lt": old_position}
                },
                {"$inc": {"slide_number": 1}}
            )
        else:
            # Moving down - shift slides up
            await slides_collection.update_many(
                {
                    "presentation_id": slide["presentation_id"],
                    "slide_number": {"$gt": old_position, "$lte": new_position}
                },
                {"$inc": {"slide_number": -1}}
            )
        
        # Update the moved slide
        await slides_collection.update_one(
            {"id": request.slide_id},
            {"$set": {"slide_number": new_position, "updated_at": datetime.now()}}
        )
        
        # Update presentation timestamp
        await presentations_collection.update_one(
            {"id": slide["presentation_id"]},
            {"$set": {"updated_at": datetime.now()}}
        )
        
        logger.info(f"Reordered slide {request.slide_id} from {old_position} to {new_position}")
        
        return {
            "success": True,
            "message": "Slide reordered successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reordering slides: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))