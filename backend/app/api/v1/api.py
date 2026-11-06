from fastapi import APIRouter

from app.api.v1.endpoints import auth, chat, dashboard, subjects, tasks

api_router = APIRouter()

# Подключаем роутер авторизации (/api/v1/auth/register, /api/v1/auth/login)
api_router.include_router(auth.router)

api_router.include_router(subjects.router)
api_router.include_router(tasks.router)
api_router.include_router(chat.router)
api_router.include_router(dashboard.router)