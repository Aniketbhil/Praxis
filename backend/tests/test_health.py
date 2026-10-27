from unittest.mock import MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import get_db

client = TestClient(app, raise_server_exceptions=False)


def test_health_endpoint_live():
    """Verify live /api/v1/health endpoint connects to the configured database."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] in ("up", "down")


def test_health_endpoint_db_up():
    """Verify /api/v1/health returns status ok and database up when DB responds."""
    mock_db = MagicMock()
    mock_result = MagicMock()
    mock_result.scalar.return_value = 1
    mock_db.execute.return_value = mock_result

    app.dependency_overrides[get_db] = lambda: mock_db
    try:
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok", "database": "up"}
    finally:
        app.dependency_overrides.clear()


def test_health_endpoint_db_down():
    """Verify /api/v1/health returns status ok and database down when DB query fails."""
    mock_db = MagicMock()
    mock_db.execute.side_effect = Exception("Database connection failure")

    app.dependency_overrides[get_db] = lambda: mock_db
    try:
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok", "database": "down"}
    finally:
        app.dependency_overrides.clear()


def test_global_exception_handler_does_not_leak_traces():
    """Verify unhandled exceptions return generic 500 without leaking stack traces."""
    @app.get("/api/v1/test-error")
    def trigger_error():
        raise RuntimeError("Secret sensitive database stack trace details")

    response = client.get("/api/v1/test-error")
    assert response.status_code == 500
    data = response.json()
    assert data == {"detail": "Internal server error"}
    assert "Secret sensitive" not in response.text
