from fastapi import APIRouter

from app.api.routes import router as root_router
from app.api.health import router as health_router
from app.config.settings import settings

api_router = APIRouter(prefix=settings.API_PREFIX)

api_router.include_router(root_router)
api_router.include_router(health_router)