#from sqlalchemy.orm import Session
#
#from backend.app.models.models import ChatMessage
#
#
#def generate_tutor_reply(
#    message: str,
#    subject: str,
#    db: Session,
#) -> str:
#    normalized = message.lower().strip()
#
#    if any(word in normalized for word in ["привет", "здравствуй", "hello"]):
#        reply = (
#            "Привет! Я Aqyl AI, твой учебный помощник. "
#            f"Сегодня можем разобраться с предметом «{subject}». "
#            "Какую тему хочешь изучить?"
#        )
#
#    elif any(word in normalized for word in ["множество", "множества"]):
#        reply = (
#            "Множество — это совокупность различных объектов, "
#            "которые рассматриваются как единое целое.\n\n"
#            "Например: A = {1, 2, 3}.\n\n"
#            "Здесь 1, 2 и 3 — элементы множества A.\n"
#            "Обозначение x ∈ A означает, что x принадлежит множеству A.\n\n"
#            "Попробуй ответить: принадлежит ли число 4 множеству A?"
#        )
#
#    elif any(word in normalized for word in ["бинарн", "отношени"]):
#        reply = (
#            "Бинарное отношение — это связь между элементами "
#            "двух множеств или одного множества.\n\n"
#            "Формально отношение R на множестве A является "
#            "подмножеством декартова произведения A × A.\n\n"
#            "Например, если A = {1, 2}, то "
#            "R = {(1, 1), (1, 2)} — пример бинарного отношения."
#        )
#
#    elif any(word in normalized for word in ["функци", "композиц"]):
#        reply = (
#            "Композиция функций — это последовательное "
#            "применение одной функции к результату другой.\n\n"
#            "Если f(x) = 2x, а g(x) = x + 3, "
#            "то (f ∘ g)(x) = f(g(x)) = 2(x + 3) = 2x + 6.\n\n"
#            "Важно: сначала выполняется внутренняя функция g, "
#            "затем внешняя f."
#        )
#
#    else:
#        reply = (
#            f"Давай разберём твой вопрос по предмету «{subject}».\n\n"
#            "Для начала разделим проблему на небольшие шаги. "
#            "Напиши конкретную тему, формулу или пример, "
#            "который вызывает затруднение. Я помогу разобрать "
#            "его последовательно."
#        )
#
#    user_message = ChatMessage(
#        role="user",
#        content=message,
#    )
#
#    assistant_message = ChatMessage(
#        role="assistant",
#        content=reply,
#    )
#
#    db.add_all([user_message, assistant_message])
#    db.commit()
#
#    return reply
