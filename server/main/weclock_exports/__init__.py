"""
The exports Blueprint handles WeClock export uploading and processing
"""
from flask_restplus import Namespace
# weclock_exports_blueprint = Blueprint('weclock_exports', __name__)
weclock_exports_ns = Namespace('exports', description='WeClock Export Uploads')

from . import routes
