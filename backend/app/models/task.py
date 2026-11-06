from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class StudyTask(Base):
    __tablename__ = "study_tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    scheduled_time = Column(String, nullable=True)
    is_completed = Column(Boolean, default=False)
    
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=True)
    
    # Привязка к пользователю
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    subject = relationship("Subject", back_populates="tasks")