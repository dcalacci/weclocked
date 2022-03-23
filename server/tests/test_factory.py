from main import create_app

def test_config():
    assert not create_app('config.DevelopmentConfig').testing
    assert create_app('config.TestingConfig').testing
