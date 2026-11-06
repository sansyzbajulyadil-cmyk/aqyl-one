from fastapi import APIRouter, Depends  # type: ignore
from sqlalchemy.orm import Session  # type: ignore

from app.api.deps import get_current_user  # type: ignore
from app.core.database import get_db  # type: ignore
from app.models.subject import Subject  # type: ignore
from app.models.user import User  # type: ignore
from app.schemas.subject import SubjectResponse  # type: ignore

router = APIRouter(prefix="/subjects", tags=["Subjects"])


@router.get("/", response_model=list[SubjectResponse])
def get_subjects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Получить только предметы текущего пользователя."""
    return db.query(Subject).filter(Subject.user_id == current_user.id).all()