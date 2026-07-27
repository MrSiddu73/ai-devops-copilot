from fastapi import FastAPI
from app.api.router import api_router
from app.config.settings import settings
from app.core.logger import setup_logger
from app.core.lifecycle import lifespan



logger = setup_logger()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    description="Production-grade AI platform for DevOps automation and troubleshooting.",
    lifespan=lifespan,
)

print(f"DEBUG = {settings.DEBUG}")
print(f"APP_ENV = {settings.APP_ENV}")

from app.exceptions.handlers import register_exception_handlers

app.include_router(api_router)

register_exception_handlers(app)

logger.info("AI-Powered DevOps Copilot initialized successfully.")