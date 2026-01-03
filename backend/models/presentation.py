from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone
from typing import List, Optional
import uuid

class Presentation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    description: str = ""
    template_id: Optional[str] = None
    thumbnail_url: str = ""
    slides: List[str] = Field(default_factory=list)  # Array of slide IDs
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_public: bool = False
    view_count: int = 0

class PresentationCreate(BaseModel):
    title: str
    description: str = ""
    template_id: Optional[str] = None

class PresentationUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    template_id: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_public: Optional[bool] = None

class PresentationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: str
    template_id: Optional[str]
    thumbnail_url: str
    slides: List[str]
    created_at: datetime
    updated_at: datetime
    is_public: bool
    view_count: int