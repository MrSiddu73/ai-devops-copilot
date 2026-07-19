from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.core.logger import setup_logger

logger = setup_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting AI-Powered DevOps Copilot...")
    # Future:
    # - Connect PostgreSQL
    # - Initialize Redis
    # - Validate AI providers
    # - Check AWS credentials
    yield
    logger.info("Shutting down AI-Powered DevOps Copilot...")
    # Future:
    # - Close database connections
    # - Close Redis
    # - Flush logs