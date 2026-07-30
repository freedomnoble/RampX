"""Backend API tests for rampX - auth, workspace, and research endpoints."""
import os
import uuid
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL") or "https://rampx-hub.preview.emergentagent.com"
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"

TEST_PASSWORD = "test1234"


def _new_email():
    return f"e2e_{uuid.uuid4().hex[:10]}@rampx.io"


# ---------- Basic health ----------
class TestHealth:
    def test_root(self):
        r = requests.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        assert "message" in r.json()


# ---------- Auth ----------
class TestAuth:
    @classmethod
    def setup_class(cls):
        cls.email = _new_email()
        cls.token = None
        cls.user_id = None

    def test_01_register(self):
        r = requests.post(f"{API}/auth/register", json={
            "email": self.__class__.email,
            "password": TEST_PASSWORD,
            "name": "E2E Test",
        }, timeout=20)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "access_token" in data and isinstance(data["access_token"], str)
        assert data["user"]["email"] == self.__class__.email
        assert data["user"]["name"] == "E2E Test"
        self.__class__.token = data["access_token"]
        self.__class__.user_id = data["user"]["id"]

    def test_02_register_duplicate(self):
        r = requests.post(f"{API}/auth/register", json={
            "email": self.__class__.email,
            "password": TEST_PASSWORD,
            "name": "dup",
        }, timeout=20)
        assert r.status_code == 400

    def test_03_login_valid(self):
        r = requests.post(f"{API}/auth/login", json={
            "email": self.__class__.email,
            "password": TEST_PASSWORD,
        }, timeout=20)
        assert r.status_code == 200
        data = r.json()
        assert "access_token" in data
        assert data["user"]["email"] == self.__class__.email

    def test_04_login_invalid(self):
        r = requests.post(f"{API}/auth/login", json={
            "email": self.__class__.email,
            "password": "wrong-password",
        }, timeout=20)
        assert r.status_code == 401

    def test_05_me_authorized(self):
        assert self.__class__.token
        r = requests.get(f"{API}/auth/me",
                         headers={"Authorization": f"Bearer {self.__class__.token}"},
                         timeout=15)
        assert r.status_code == 200
        assert r.json()["email"] == self.__class__.email

    def test_06_me_unauthorized(self):
        r = requests.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401

    def test_07_admin_login(self):
        # admin from seed
        r = requests.post(f"{API}/auth/login", json={
            "email": "admin@rampx.io",
            "password": "admin123",
        }, timeout=20)
        assert r.status_code == 200, r.text
        assert "access_token" in r.json()


# ---------- Workspace CRUD ----------
class TestWorkspace:
    @classmethod
    def setup_class(cls):
        cls.email = _new_email()
        r = requests.post(f"{API}/auth/register", json={
            "email": cls.email, "password": TEST_PASSWORD, "name": "WS User",
        }, timeout=20)
        assert r.status_code == 200
        cls.token = r.json()["access_token"]
        cls.headers = {"Authorization": f"Bearer {cls.token}"}

    def test_01_get_empty(self):
        r = requests.get(f"{API}/workspace", headers=self.__class__.headers, timeout=15)
        assert r.status_code == 200
        assert r.json() == {"data": None}

    def test_02_get_unauthorized(self):
        r = requests.get(f"{API}/workspace", timeout=15)
        assert r.status_code == 401

    def test_03_put_workspace(self):
        payload = {"data": {"company_name": "TEST_Notion", "goals": [{"id": "g1", "title": "Test goal"}]}}
        r = requests.put(f"{API}/workspace", headers=self.__class__.headers, json=payload, timeout=15)
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_04_get_after_put(self):
        r = requests.get(f"{API}/workspace", headers=self.__class__.headers, timeout=15)
        assert r.status_code == 200
        data = r.json()["data"]
        assert data["company_name"] == "TEST_Notion"
        assert data["goals"][0]["title"] == "Test goal"

    def test_05_put_unauthorized(self):
        r = requests.put(f"{API}/workspace", json={"data": {}}, timeout=15)
        assert r.status_code == 401

    def test_06_upsert_updates(self):
        payload = {"data": {"company_name": "TEST_Updated", "flag": True}}
        r = requests.put(f"{API}/workspace", headers=self.__class__.headers, json=payload, timeout=15)
        assert r.status_code == 200
        r2 = requests.get(f"{API}/workspace", headers=self.__class__.headers, timeout=15)
        assert r2.json()["data"]["company_name"] == "TEST_Updated"
        assert r2.json()["data"]["flag"] is True


# ---------- Research ----------
class TestResearch:
    def test_01_research_shape(self):
        r = requests.post(f"{API}/research", json={
            "company_name": "Notion",
            "product_area": "team productivity software",
        }, timeout=120)
        assert r.status_code == 200, r.text
        data = r.json()
        for k in ["overview", "website", "competitors", "releases",
                  "news", "goals_suggestions", "flashcards"]:
            assert k in data, f"missing key: {k}"
        assert isinstance(data["competitors"], list)
        assert len(data["competitors"]) == 4, f"expected 4 competitors got {len(data['competitors'])}"
        # each competitor has required subfields
        for c in data["competitors"]:
            assert "name" in c and "strengths" in c and "weaknesses" in c
            assert "differentiation" in c and "recent_release" in c
        assert isinstance(data["releases"], list)
        assert len(data["releases"]) >= 3
        assert isinstance(data["flashcards"], list)
        assert len(data["flashcards"]) == 12, f"expected 12 flashcards got {len(data['flashcards'])}"
        for f in data["flashcards"]:
            assert "term" in f and "concept" in f

    def test_02_research_with_url(self):
        r = requests.post(f"{API}/research", json={
            "company_name": "Notion",
            "product_area": "team productivity software",
            "url": "https://www.notion.so",
        }, timeout=120)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "overview" in data and "website" in data
        assert len(data["competitors"]) == 4
        # New requirement: competitors carry website + linkedin fields
        for c in data["competitors"]:
            assert "website" in c, f"competitor missing website: {c}"
            assert "linkedin" in c, f"competitor missing linkedin: {c}"
        assert len(data["flashcards"]) == 12
        assert len(data["releases"]) >= 3
        assert len(data["news"]) >= 3

    def test_03_research_empty_name(self):
        r = requests.post(f"{API}/research", json={
            "company_name": "  ",
            "product_area": "x",
        }, timeout=30)
        assert r.status_code == 400
