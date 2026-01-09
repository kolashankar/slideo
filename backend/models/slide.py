from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

# Element Models
class ElementPosition(BaseModel):
    """Position and size of an element on the slide"""
    x: float = Field(..., description="X position (0-100% of slide width)")
    y: float = Field(..., description="Y position (0-100% of slide height)")
    width: float = Field(..., description="Width (0-100% of slide width)")
    height: float = Field(..., description="Height (0-100% of slide height)")
    z_index: int = Field(default=0, description="Layer order (higher is on top)")

class TextStyle(BaseModel):
    """Styling for text elements"""
    font_family: str = Field(default="Inter", description="Font family")
    font_size: int = Field(default=16, description="Font size in pixels")
    font_weight: int = Field(default=400, description="Font weight (400, 500, 600, 700)")
    color: str = Field(default="#000000", description="Text color (hex)")
    align: str = Field(default="left", description="Text alignment (left, center, right, justify)")
    line_height: float = Field(default=1.5, description="Line height multiplier")
    letter_spacing: float = Field(default=0, description="Letter spacing in pixels")

class ShapeStyle(BaseModel):
    """Styling for shape elements"""
    fill_color: str = Field(default="#FFFFFF", description="Fill color (hex)")
    stroke_color: str = Field(default="#000000", description="Stroke color (hex)")
    stroke_width: int = Field(default=2, description="Stroke width in pixels")
    opacity: float = Field(default=1.0, description="Opacity (0-1)")
    border_radius: int = Field(default=0, description="Border radius in pixels")

class ImageStyle(BaseModel):
    """Styling for image elements"""
    opacity: float = Field(default=1.0, description="Opacity (0-1)")
    border_radius: int = Field(default=0, description="Border radius in pixels")
    object_fit: str = Field(default="cover", description="How image fits (cover, contain, fill)")
    filter: Optional[str] = Field(None, description="CSS filter effects")

class SlideElement(BaseModel):
    """A single element on a slide (text, image, or shape)"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique element ID")
    type: str = Field(..., description="Element type (text, image, shape)")
    position: ElementPosition = Field(..., description="Position and size")
    content: Dict[str, Any] = Field(default_factory=dict, description="Element-specific content")
    style: Dict[str, Any] = Field(default_factory=dict, description="Element-specific styling")
    locked: bool = Field(default=False, description="Whether element is locked from editing")
    visible: bool = Field(default=True, description="Whether element is visible")
    animation: Optional[Dict[str, Any]] = Field(None, description="Animation settings")

class SlideBackground(BaseModel):
    """Background styling for a slide"""
    type: str = Field(default="solid", description="Background type (solid, gradient, image)")
    color: str = Field(default="#FFFFFF", description="Background color (hex)")
    gradient: Optional[Dict[str, Any]] = Field(None, description="Gradient settings if type is gradient")
    image_url: Optional[str] = Field(None, description="Image URL if type is image")
    image_base64: Optional[str] = Field(None, description="Base64 image data")
    opacity: float = Field(default=1.0, description="Background opacity (0-1)")

# Main Slide Model
class Slide(BaseModel):
    """A presentation slide with elements"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique slide ID")
    presentation_id: str = Field(..., description="ID of parent presentation")
    slide_number: int = Field(..., description="Position in presentation (1-based)")
    title: str = Field(default="Untitled Slide", max_length=200, description="Slide title")
    layout: str = Field(default="blank", description="Layout type (title-slide, content, blank, etc.)")
    elements: List[SlideElement] = Field(default_factory=list, description="Elements on the slide")
    background: SlideBackground = Field(default_factory=SlideBackground, description="Slide background")
    notes: str = Field(default="", max_length=5000, description="Speaker notes")
    duration: Optional[int] = Field(None, description="Display duration in seconds (for auto-play)")
    transition: Optional[Dict[str, Any]] = Field(None, description="Slide transition settings")
    created_at: datetime = Field(default_factory=datetime.now, description="Creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.now, description="Last update timestamp")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "slide-123",
                "presentation_id": "pres-456",
                "slide_number": 1,
                "title": "Introduction",
                "layout": "title-slide",
                "elements": [
                    {
                        "id": "elem-1",
                        "type": "text",
                        "position": {"x": 20, "y": 40, "width": 60, "height": 20, "z_index": 1},
                        "content": {"text": "Welcome to the Presentation"},
                        "style": {"font_size": 48, "font_weight": 700, "color": "#000000"}
                    }
                ],
                "background": {
                    "type": "solid",
                    "color": "#FFFFFF"
                },
                "notes": "Start with an engaging introduction"
            }
        }

# Request Models for API
class CreateSlideRequest(BaseModel):
    """Request to create a new slide"""
    presentation_id: str = Field(..., description="Parent presentation ID")
    slide_number: int = Field(..., description="Position in presentation")
    title: str = Field(default="Untitled Slide", max_length=200)
    layout: str = Field(default="blank", description="Layout type")
    template_id: Optional[str] = Field(None, description="Template to apply")

class UpdateSlideRequest(BaseModel):
    """Request to update a slide"""
    title: Optional[str] = Field(None, max_length=200)
    layout: Optional[str] = None
    elements: Optional[List[SlideElement]] = None
    background: Optional[SlideBackground] = None
    notes: Optional[str] = Field(None, max_length=5000)
    duration: Optional[int] = None
    transition: Optional[Dict[str, Any]] = None

class ReorderSlidesRequest(BaseModel):
    """Request to reorder slides"""
    slide_id: str = Field(..., description="ID of slide to move")
    new_position: int = Field(..., description="New slide number (1-based)")

class AddElementRequest(BaseModel):
    """Request to add an element to a slide"""
    slide_id: str = Field(..., description="Target slide ID")
    element: SlideElement = Field(..., description="Element to add")

class UpdateElementRequest(BaseModel):
    """Request to update an element"""
    slide_id: str = Field(..., description="Slide containing the element")
    element_id: str = Field(..., description="Element to update")
    position: Optional[ElementPosition] = None
    content: Optional[Dict[str, Any]] = None
    style: Optional[Dict[str, Any]] = None
    locked: Optional[bool] = None
    visible: Optional[bool] = None

class DeleteElementRequest(BaseModel):
    """Request to delete an element"""
    slide_id: str = Field(..., description="Slide containing the element")
    element_id: str = Field(..., description="Element to delete")