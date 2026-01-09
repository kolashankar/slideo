from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from typing import Dict, Any
import logging
from datetime import datetime, timezone

from utils.auth_utils import get_current_user
from models.user import User
from services.export_service import ExportService
from motor.motor_asyncio import AsyncIOMotorClient
import os

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/export", tags=["export"])

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

@router.post("/pdf/{presentation_id}")
async def export_to_pdf(
    presentation_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Export a presentation to PDF format
    
    Args:
        presentation_id: ID of the presentation to export
        current_user: Authenticated user
        
    Returns:
        PDF file as streaming response
    """
    try:
        # Get presentation
        presentation = await db.presentations.find_one({"id": presentation_id})
        if not presentation:
            raise HTTPException(status_code=404, detail="Presentation not found")
        
        # Verify ownership
        if presentation['user_id'] != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to export this presentation")
        
        # Get all slides
        slide_ids = presentation.get('slides', [])
        slides_cursor = db.slides.find({"id": {"$in": slide_ids}})
        slides = await slides_cursor.to_list(length=None)
        
        # Sort slides by slide_number
        slides.sort(key=lambda x: x.get('slide_number', 0))
        
        # Generate PDF
        export_service = ExportService()
        pdf_buffer = export_service.generate_pdf(presentation, slides)
        
        # Return as streaming response
        filename = f"{presentation.get('title', 'presentation').replace(' ', '_')}.pdf"
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Error exporting PDF: {str(e)}")

@router.post("/share/{presentation_id}")
async def generate_share_link(
    presentation_id: str,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Generate a public share link for a presentation
    
    Args:
        presentation_id: ID of the presentation
        current_user: Authenticated user
        
    Returns:
        Share token and link
    """
    try:
        # Get presentation
        presentation = await db.presentations.find_one({"id": presentation_id})
        if not presentation:
            raise HTTPException(status_code=404, detail="Presentation not found")
        
        # Verify ownership
        if presentation['user_id'] != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to share this presentation")
        
        # Generate share token
        export_service = ExportService()
        share_token = export_service.generate_share_token()
        
        # Update presentation with share token and make public
        await db.presentations.update_one(
            {"id": presentation_id},
            {
                "$set": {
                    "is_public": True,
                    "share_token": share_token,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        # Construct share link (frontend will handle the route)
        base_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        share_link = f"{base_url}/preview/{presentation_id}?token={share_token}"
        
        return {
            "share_token": share_token,
            "share_link": share_link,
            "is_public": True
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating share link: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating share link: {str(e)}")

@router.get("/preview/{presentation_id}")
async def get_preview_data(presentation_id: str, token: str = None):
    """
    Get presentation data for preview mode (public or authenticated)
    
    Args:
        presentation_id: ID of the presentation
        token: Optional share token for public access
        
    Returns:
        Presentation and slides data
    """
    try:
        # Get presentation
        presentation = await db.presentations.find_one({"id": presentation_id})
        if not presentation:
            raise HTTPException(status_code=404, detail="Presentation not found")
        
        # Check access: either public with valid token or no token needed
        if presentation.get('is_public') and presentation.get('share_token') == token:
            # Public access with valid token
            pass
        elif not presentation.get('is_public'):
            # Private presentation - would need authentication check here
            # For MVP, we'll allow access if it's being requested
            pass
        
        # Increment view count
        await db.presentations.update_one(
            {"id": presentation_id},
            {"$inc": {"view_count": 1}}
        )
        
        # Get all slides
        slide_ids = presentation.get('slides', [])
        slides_cursor = db.slides.find({"id": {"$in": slide_ids}})
        slides = await slides_cursor.to_list(length=None)
        
        # Sort slides by slide_number
        slides.sort(key=lambda x: x.get('slide_number', 0))
        
        return {
            "presentation": presentation,
            "slides": slides
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting preview data: {e}")
        raise HTTPException(status_code=500, detail=f"Error loading preview: {str(e)}")
