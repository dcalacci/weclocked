class Config(object):
    DEBUG = True
    DEVELOPMENT = True
    SECRET_KEY = 'do-i-really-need-this'
    FLASK_SECRET = SECRET_KEY
    TESTING = False

class ProductionConfig(Config):
    DEVELOPMENT = False
    DEBUG = False

class DevelopmentConfig(Config):
    DEVELOPMENT = True 
    DEBUG = True

class TestingConfig(Config):
    DEVELOPMENT = True 
    DEBUG = True
    TESTING = True
