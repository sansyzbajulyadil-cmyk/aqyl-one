from openai import OpenAI

# Ollama по умолчанию поднимается на локальном порту 11434
client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",  # Ollama не требует реального ключа, но клиент требует строку
)


def ask_ai_tutor(prompt: str, subject: str = "Общие вопросы") -> str:
    """Отправляет запрос к локальной LLM через Ollama."""
    try:
        response = client.chat.completions.create(
            model="llama3",  # Укажите модель, которую скачали (например, llama3)
            messages=[
                {
                    "role": "system",
                    "content": (
                        f"Ты — умный и дружелюбный ИИ-тьютор по предмету '{subject}' в платформе 'Aqyl One'. "
                        "Помогай студенту разбирать сложные темы, объясняй концепции простым языком "
                        "и давай структурированные ответы."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
        )
        return response.choices[0].message.content
    except Exception as e:  # noqa: BLE001
        return (
            f"⚠️ Не удалось подключиться к локальной модели Ollama. "
            f"Убедитесь, что она запущена. Ошибка: {e!s}"
        )