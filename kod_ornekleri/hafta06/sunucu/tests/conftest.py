"""Ortak pytest fixture'ları — her test TEMİZ, boş bir depoyla başlar."""

import pytest
from fastapi.testclient import TestClient

from app.bagimliliklar import get_depo
from app.depo import Depo
from app.main import app


# BEGIN test_istemci_fixture
@pytest.fixture
def client():
    test_depo = Depo()
    app.dependency_overrides[get_depo] = lambda: test_depo
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
# END test_istemci_fixture
