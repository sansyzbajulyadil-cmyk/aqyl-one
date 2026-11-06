from fastapi import APIRouter, Depends, HTTPException, status  # type: ignore
from sqlalchemy.orm import Session  # type: ignore

from app.api.deps import get_current_user  # type: ignore
from app.core.database import get_db  # type: ignore
from app.models.task import StudyTask  # type: ignore
from app.models.user import User  # type: ignore
from app.schemas.task import TaskResponse, TaskUpdate  # type: ignore

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("/", response_model=list[TaskResponse])
def get_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Получить задачи только текущего авторизованного пользователя."""
    return (
        db.query(StudyTask)
        .filter(StudyTask.user_id == current_user.id)
        .order_by(StudyTask.scheduled_time)
        .all()
    )


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Обновить статус задачи (только если она принадлежит текущему пользователю)."""
    task = (
        db.query(StudyTask)
        .filter(StudyTask.id == task_id, StudyTask.user_id == current_user.id)
        .first()
    )

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    task.is_completed = data.is_completed
    db.commit()
    db.refresh(task)

    return task