from sqlalchemy.orm import Session

from app.database.models.incident import Incident


class IncidentRepository:

    def create_incident(
        self,
        db: Session,
        incident: Incident,
    ) -> Incident:
        db.add(incident)
        db.commit()
        db.refresh(incident)
        return incident

    def get_incident_by_id(
        self,
        db: Session,
        incident_id: int,
    ) -> Incident | None:
        return (
            db.query(Incident)
            .filter(Incident.id == incident_id)
            .first()
        )

    def get_all_incidents(
        self,
        db: Session,
    ) -> list[Incident]:
        return (
            db.query(Incident)
            .all()
        )

    def update_incident(
        self,
        db: Session,
        incident: Incident,
    ) -> Incident:
        db.commit()
        db.refresh(incident)
        return incident

    def delete_incident(
        self,
        db: Session,
        incident: Incident,
    ) -> None:
        db.delete(incident)
        db.commit()