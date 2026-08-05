from datetime import datetime

from sqlalchemy import (
    ForeignKey,
    Integer,
    String,
    Text,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from app.database.base import Base
from sqlalchemy.orm import relationship
from app.enums.incident_status import IncidentStatus
from sqlalchemy.dialects.postgresql import ENUM
from app.enums.incident_severity import IncidentSeverity

class Incident(Base):

    __tablename__ = "incidents"
    
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    severity: Mapped[IncidentSeverity] = mapped_column(
    ENUM(
        IncidentSeverity,
        name="incidentseverity",
        create_type=False,
        ),
        nullable=False,
    )

    status: Mapped[IncidentStatus] = mapped_column(
        ENUM(
            IncidentStatus,
            name="incidentstatus",
            create_type=False,
        ),
        default=IncidentStatus.OPEN,
        nullable=False,
    )

    created_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    assigned_to: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
    )

    creator = relationship(
        "User",
        foreign_keys=[created_by],
        back_populates="created_incidents",
    )

    assignee = relationship(
        "User",
        foreign_keys=[assigned_to],
        back_populates="assigned_incidents",
    )