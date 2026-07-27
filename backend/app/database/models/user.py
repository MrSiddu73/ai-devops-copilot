from datetime import datetime

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column ## Mapped => This Python attribute is mapped to a database column." and mapped_column => It integrates better with typing and is the modern API.

from app.database.base import Base


class User(Base):
    __tablename__ = "users" ## Without __tablename__, SQLAlchemy wouldn't know what table this class represents.

    id: Mapped[int] = mapped_column(  ## "The id attribute is mapped to a database column and will contain an integer."
        Integer,
        primary_key=True,
    )

    username: Mapped[str] = mapped_column(
        String(50),
        nullable=False, ## This column must always have a value.
    )

    email: Mapped[str] = mapped_column(
    String(255),   ## 255 has become a widely accepted maximum length for email fields and is commonly used in production applications.
    unique=True,
    nullable=False,
   )
    
    created_at: Mapped[datetime] = mapped_column(
    DateTime,
    default=datetime.utcnow,  ## This sets the default value of the created_at column to the current UTC time when a new record is created.
    nullable=False,
    )

    ## default=datetime.utcnow passes the function reference to SQLAlchemy, allowing it to execute the function each time a new row is created. Using datetime.utcnow() would execute the function immediately when the model is loaded, causing every new row to receive the same timestamp."
    
    password_hash: Mapped[str] = mapped_column(
    String(255),
    nullable=False,
    )