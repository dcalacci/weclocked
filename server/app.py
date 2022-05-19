from main import create_app
from flask_cors import CORS
 
# Call the Application Factory function to construct a Flask application instance
# using the standard configuration defined in /instance/flask.cfg
app = create_app('config.DevelopmentConfig')

CORS(app, support_credentials=True)
