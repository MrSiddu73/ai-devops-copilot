from fastapi import APIRouter

from app.api.v1.user import router as user_router


from app.api.routes import router as root_router
from app.api.health import router as health_router
from app.config.settings import settings
from app.api.v1 import incident


api_router = APIRouter(prefix=settings.API_PREFIX)

api_router.include_router(root_router)
api_router.include_router(health_router)

api_router.include_router(user_router)

api_router.include_router(incident.router)

