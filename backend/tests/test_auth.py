import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.core.database import Base, get_db
from backend.app.main import app

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_register_user_success():
    payload = {"username": "alice", "email": "alice@example.com", "password": "StrongPass123!"}
    response = client.post("/auth/register", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert "id" in data and data["id"]
    assert data["username"] == payload["username"]
    assert data["email"] == payload["email"]
    assert data["role"] == "Volunteer"
    assert data["status"] == "active"
    assert "created_at" in data


def test_register_rejects_duplicate_username():
    payload = {"username": "bob", "email": "bob@example.com", "password": "AnotherPass123!"}
    client.post("/auth/register", json=payload)

    response = client.post("/auth/register", json={**payload, "email": "bob2@example.com"})
    assert response.status_code == 400
    assert response.json()["detail"] == "Username already registered"


def test_register_validation_error_shape():
    # Missing email and password triggers validation
    response = client.post("/auth/register", json={"username": "short"})
    assert response.status_code == 422
    body = response.json()
    assert "detail" in body and isinstance(body["detail"], list)


def test_register_rejects_invalid_username():
    response = client.post(
        "/auth/register",
        json={"username": "no spaces allowed", "email": "good@example.com", "password": "ValidPass123!"},
    )
    assert response.status_code == 422
    detail = response.json()["detail"]
    assert any("Username must be 3-30 chars" in err["msg"] for err in detail)


def test_register_rejects_weak_password():
    response = client.post(
        "/auth/register",
        json={"username": "valid_user", "email": "good@example.com", "password": "alllowercase"},
    )
    assert response.status_code == 422
    detail = response.json()["detail"]
    assert any("Password must include upper, lower, and a digit" in err["msg"] for err in detail)


def test_register_rejects_bad_email():
    response = client.post(
        "/auth/register",
        json={"username": "valid_user", "email": "not-an-email", "password": "ValidPass123!"},
    )
    assert response.status_code == 422
    detail = response.json()["detail"]
    assert any("valid email" in err["msg"] for err in detail)


def test_login_returns_token():
    payload = {"username": "carol", "email": "carol@example.com", "password": "ValidPass123!"}
    client.post("/auth/register", json=payload)

    response = client.post("/auth/login", json={"username": "carol", "password": payload["password"]})
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == payload["username"]
    assert "id" in data and data["id"]
    assert data["role"] == "Volunteer"
    assert data["status"] == "active"
    assert "token" in data and data["token"]
