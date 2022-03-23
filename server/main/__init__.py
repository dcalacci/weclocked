from flask import Flask
from flask_restx import Api
from flask_cors import CORS

def register_namespaces(api):
    from .weclock_exports import weclock_exports_ns as exports_ns
    api.add_namespace(exports_ns)

def create_app(config):
    app = Flask(__name__, instance_relative_config=True)
    CORS(app)
    print("using configuration: ", config)
    app.config.from_object(config)
    api = Api(app,
              version = '1.0',
              title = "WeClock API",
              description = "Handles WeClock data exports and simple processing")

    register_namespaces(api)
    return app
