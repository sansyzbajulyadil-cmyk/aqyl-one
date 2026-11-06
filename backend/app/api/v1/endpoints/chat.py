from fastapi import APIRouter, Depends  # type: ignore
from sqlalchemy.orm import Session  # type: ignore

from app.api.deps import get_current_user  # type: ignore
from app.core.database import get_db  # type: ignore
from app.models.chat import ChatMessage  # type: ignore
from app.models.user import User  # type: ignore
from app.schemas.chat import ChatMessageCreate, ChatMessageResponse  # type: ignore
from app.services.ai_tutor import ask_ai_tutor  # type: ignore

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.get("/", response_model=list[ChatMessageResponse])
def get_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Получить историю сообщений авторизованного пользователя."""
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )


@router.post("/", response_model=ChatMessageResponse)
def send_chat_message(
    payload: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Отправить сообщение ИИ-тьютору от имени авторизованного пользователя."""
    # 1. Сохраняем сообщение пользователя
    user_msg = ChatMessage(
        role="user", content=payload.content, user_id=current_user.id
    )
    db.add(user_msg)
    db.commit()

    # 2. Получаем ответ от локальной Llama 3
    ai_reply_text = ask_ai_tutor(
        prompt=payload.content, subject="Дискретная математика"
    )

    # 3. Сохраняем ответ ИИ
    ai_msg = ChatMessage(
        role="assistant", content=ai_reply_text, user_id=current_user.id
    )
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)

    return ai_msg