from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.core.security import get_password_hash
from app.models.subject import Subject
from app.models.task import StudyTask
from app.models.topic import Topic
from app.models.user import User

load_dotenv()


def seed_database():
    """Автоматическое наполнение базы данных демо-данными и демо-пользователем."""
    db = SessionLocal()
    try:
        # Проверяем, есть ли уже пользователи в базе
        if db.query(User).first(): # type: ignore
            return

        # Создаем демо-пользователя для автозаполнения
        demo_user = User(
            email="adil@aqyl.one",
            hashed_password=get_password_hash("password123"),
            is_active=True,
        )
        db.add(demo_user)
        db.flush()  # Получаем ID созданного пользователя

        discrete_math = Subject(
            name="Дискретная математика",
            teacher="Демонстрационный преподаватель",
            user_id=demo_user.id,
        )

        programming = Subject(
            name="Основы программирования",
            teacher="Демонстрационный преподаватель",
            user_id=demo_user.id,
        )

        db.add_all([discrete_math, programming])
        db.flush()

        topics = [
            Topic(
                name="Множества",
                description="Основы теории множеств",
                progress=90,
                status="mastered",
                subject_id=discrete_math.id,
            ),
            Topic(
                name="Логические операции",
                description="Операции и таблицы истинности",
                progress=75,
                status="learning",
                subject_id=discrete_math.id,
            ),
            Topic(
                name="Бинарные отношения",
                description="Свойства и виды отношений",
                progress=45,
                status="learning",
                subject_id=discrete_math.id,
            ),
            Topic(
                name="Композиция функций",
                description="Композиция и обратные функции",
                progress=30,
                status="weak",
                subject_id=discrete_math.id,
            ),
            Topic(
                name="Булева алгебра",
                description="Законы и преобразования",
                progress=65,
                status="learning",
                subject_id=discrete_math.id,
            ),
            Topic(
                name="Переменные и типы данных",
                description="Базовые конструкции Python",
                progress=80,
                status="learning",
                subject_id=programming.id,
            ),
        ]

        db.add_all(topics)
        db.flush()

        tasks = [
            StudyTask(
                title="Повторить бинарные отношения",
                description="Изучить свойства отношений и примеры",
                scheduled_time="10:00",
                subject_id=discrete_math.id,
                user_id=demo_user.id,
            ),
            StudyTask(
                title="Разобрать композицию функций",
                description="Решить 5 практических примеров",
                scheduled_time="12:00",
                subject_id=discrete_math.id,
                user_id=demo_user.id,
            ),
            StudyTask(
                title="Повторить булеву алгебру",
                description="Закрепить основные законы",
                scheduled_time="15:00",
                subject_id=discrete_math.id,
                user_id=demo_user.id,
            ),
            StudyTask(
                title="Практика Python",
                description="Решить задачи на переменные",
                scheduled_time="17:00",
                subject_id=programming.id,
                user_id=demo_user.id,
            ),
        ]

        db.add_all(tasks)
        db.commit()

    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Создаем таблицы при старте и сидируем демо-данные
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for Aqyl One educational platform",
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

# Настройка CORS для фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем общий роутер API с префиксом /api
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "application": "Aqyl One",
        "message": "Welcome to Aqyl One API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Aqyl One API",
    }