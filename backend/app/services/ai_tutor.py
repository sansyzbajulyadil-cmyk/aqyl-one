
from google import genai

from app.core.config import settings


def ask_ai_tutor(
    prompt: str,
    subject: str = "Дискретная математика",
) -> str:
    """AI tutor for Aqyl One powered by Google Gemini."""

    if not settings.GEMINI_API_KEY:
        return "ИИ-репетитор не настроен: отсутствует API-ключ Gemini."

    try:
        client = genai.Client(
            api_key=settings.GEMINI_API_KEY
        )

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=[
                f"""
Ты — персональный ИИ-репетитор образовательной платформы Aqyl One.

Твой предмет: {subject}.

Правила работы:
1. Объясняй сложные темы простым, но академически точным языком.
2. Разбирай задачи пошагово, объясняя логику каждого действия.
3. Приводи примеры, если они помогают понять тему.
4. Не выдавай решение без объяснения, когда студент просит разобраться.
5. Отвечай на языке вопроса: русском.
6. Не выдумывай факты и признавай неопределённость.

Вопрос студента:
{prompt}
"""
            ],
        )

        return response.text or "ИИ не смог сформировать ответ."

    except Exception as exc:  # noqa: BLE001
        print(f"Gemini API error: {type(exc).__name__}")
        return (
            "ИИ-репетитор временно недоступен. "
            "Попробуйте повторить запрос позже."
        )
