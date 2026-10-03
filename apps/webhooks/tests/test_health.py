import pytest

from backstage_webhooks import create_app


@pytest.fixture
def client():
    app = create_app({"TESTING": True})

    with app.test_client() as test_client:
        yield test_client


def test_health_returns_service_status(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.is_json
    assert response.get_json() == {
        "status": "ok",
        "service": "backstage-webhooks",
    }


def test_unknown_route_returns_404(client):
    response = client.get("/missing")

    assert response.status_code == 404
