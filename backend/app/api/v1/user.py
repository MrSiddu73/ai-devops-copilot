from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.database.models.user import User

from app.schemas.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    Token,
)

from app.services.user_service import UserService

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)

user_service = UserService()


@router.post(
    "/register",
    response_model=UserResponse,
)
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    return user_service.register_user(
        db,
        user,
    )

@router.post(
    "/login",
    response_model=Token,
)
def login(
    login_data: UserLogin,
    db: Session = Depends(get_db),
):
    access_token = user_service.login_user(
        db,
        login_data,
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
    )

@router.get(
    "/me",
    response_model=UserResponse,
)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
):
    return current_user
