from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    teacher = Column(String, nullable=True)
    
    # Привязка к пользователю
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    topics = relationship("Topic", back_populates="subject", cascade="all, delete-orphan")
    tasks = relationship("StudyTask", back_populates="subject", cascade="all, delete-orphan")