from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=3000)
    subject: str = "Дискретная математика"


class ChatResponse(BaseModel):
    reply: str
    mode: str


# Классы, которые ждет эндпоинт чата
class ChatMessageCreate(BaseModel):
    content: str


class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime
    user_id: int | None = None

    model_config = ConfigDict(from_attributes=True)


class ChatHistoryResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)