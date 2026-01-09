from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
import uuid

class ChatContext(BaseModel):
    """Context information for chat messages"""
    slide_id: Optional[str] = None
    slide_number: Optional[int] = None
    slide_title: Optional[str] = None
    slide_content: Optional[str] = None

class ChatMessage(BaseModel):
    """Chat message model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    presentation_id: str
    user_id: str
    role: str = Field(..., pattern="^(user|assistant)$")  # user or assistant
    content: str = Field(..., min_length=1, max_length=5000)
    context: Optional[ChatContext] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChatMessageResponse(BaseModel):
    """Response model for chat messages"""
    id: str
    presentation_id: str
    user_id: str
    role: str
    content: str
    context: Optional[ChatContext] = None
    created_at: datetime

class SendChatRequest(BaseModel):
    """Request to send a chat message"""
    presentation_id: str
    message: str = Field(..., min_length=1, max_length=5000)
    context: Optional[ChatContext] = None

class ApplySuggestionRequest(BaseModel):
    """Request to apply AI suggestion to slide"""
    slide_id: str
    suggestion_type: str = Field(..., description="Type of suggestion: content, layout, style")
    suggestion_data: Dict[str, Any] = Field(..., description="Suggestion data to apply")
