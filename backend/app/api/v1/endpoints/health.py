from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.health import get_health_status

router = APIRouter()


@router.get("/health")
def health_endpoint(db: Session = Depends(get_db)) -> dict[str, str]:
    """Health check endpoint reporting API and database connectivity status."""
    return get_health_status(db)
