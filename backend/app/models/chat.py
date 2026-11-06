from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func

from app.core.database import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    role = Column(String, nullable=False)  # "user" или "assistant"
    content = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Привязка к пользователю
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)