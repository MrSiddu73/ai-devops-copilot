from sqlalchemy.orm import Session

from app.database.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate

from app.core.security import hash_password

class UserService:

    def __init__(self):
        self.user_repository = UserRepository()

    def create_user(self, db: Session, user_data: UserCreate) -> User:
        hashed_password = hash_password(user_data.password)
        user = User(
            username=user_data.username,
            email=user_data.email,
            password_hash=hashed_password,
        )

        return self.user_repository.create_user(db, user)