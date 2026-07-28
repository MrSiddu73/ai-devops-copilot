from sqlalchemy.orm import Session

from app.database.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import (
    UserCreate,
    UserLogin,
    Token
)
from app.core.security import verify_password
from app.core.jwt import create_access_token

from fastapi import HTTPException, status

from app.core.security import hash_password

class UserService:

    def __init__(self):
        self.user_repository = UserRepository()

    def register_user(self, db: Session, user_data: UserCreate) -> User:
        hashed_password = hash_password(user_data.password)
        user = User(
            username=user_data.username,
            email=user_data.email,
            password_hash=hashed_password,
        )

        return self.user_repository.create_user(db, user)

    def login_user(
    self,
    db: Session,
    login_data: UserLogin,
) -> str:
        user = self.user_repository.get_user_by_email(db, login_data.email)

        if user is None:
            raise HTTPException(
                status_code=404,
                detail="Invalid email or password",
            )

        if not verify_password(
            login_data.password,
            user.password_hash,
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        access_token = create_access_token(user.id)
        return access_token