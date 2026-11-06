from fastapi import APIRouter, Depends  # type: ignore
from sqlalchemy.orm import Session  # type: ignore

from app.api.deps import get_current_user  # type: ignore
from app.core.database import get_db  # type: ignore
from app.models.subject import Subject  # type: ignore
from app.models.task import StudyTask  # type: ignore
from app.models.topic import Topic  # type: ignore
from app.models.user import User  # type: ignore
from app.schemas.dashboard import DashboardResponse  # type: ignore

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/", response_model=DashboardResponse)
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Получить сводную статистику для дашборда текущего пользователя."""
    user_tasks = db.query(StudyTask).filter(StudyTask.user_id == current_user.id).all()
    
    total_tasks = len(user_tasks)
    completed_tasks = sum(1 for t in user_tasks if t.is_completed)
    
    user_subject_ids = db.query(Subject.id).filter(Subject.user_id == current_user.id).subquery()
    topics = db.query(Topic).filter(Topic.subject_id.in_(user_subject_ids)).all()
    
    total_topics = len(topics)
    mastered_topics = sum(1 for top in topics if top.status == "mastered")
    
    overall_progress = (
        int(sum(top.progress for top in topics) / total_topics)
        if total_topics > 0
        else 0
    )

    return {
        "overall_progress": overall_progress,
        "completed_tasks": completed_tasks,
        "total_tasks": total_tasks,
        "mastered_topics": mastered_topics,
        "total_topics": total_topics,
        "study_streak_days": 5,
    }