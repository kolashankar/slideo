from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone
from typing import List, Dict, Any
import uuid

class Template(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str
    description: str = ""
    thumbnail_url: str
    color_scheme: Dict[str, str]
    font_family: str
    slide_layouts: List[Dict[str, Any]] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TemplateResponse(BaseModel):
    id: str
    name: str
    category: str
    description: str
    thumbnail_url: str
    color_scheme: Dict[str, str]
    font_family: str
    slide_layouts: List[Dict[str, Any]]
    created_at: datetime