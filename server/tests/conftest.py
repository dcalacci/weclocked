import pytest
from main import create_app

@pytest.fixture(scope="session")
def app():
    app = create_app('config.TestingConfig')
    return app

@pytest.fixture(scope="module")
def client(app):
    return app.test_client()

@pytest.fixture(scope="module")
def runner(app):
    return app.test_cli_runner()

