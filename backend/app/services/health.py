import logging
from sqlalchemy import text
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


def check_database_connectivity(db: Session) -> bool:
    """Executes SELECT 1 on the database connection to verify health."""
    try:
        result = db.execute(text("SELECT 1")).scalar()
        return result == 1
    except Exception as exc:
        logger.warning("Database connectivity check failed: %s", exc)
        return False


def get_health_status(db: Session) -> dict[str, str]:
    """Returns the overall system health payload."""
    db_up = check_database_connectivity(db)
    return {
        "status": "ok",
        "database": "up" if db_up else "down",
    }
