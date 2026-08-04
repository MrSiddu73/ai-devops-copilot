from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    DEVOPS_ENGINEER = "devops_engineer"
    VIEWER = "viewer"