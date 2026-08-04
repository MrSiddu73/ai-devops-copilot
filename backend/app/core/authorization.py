from fastapi import Depends, HTTPException, status

from app.core.dependencies import get_current_user
from app.database.models.user import User
from app.enums.user_role import UserRole


def require_role(required_role: UserRole):

    def role_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:

        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions",
            )

        return current_user

    return role_checker