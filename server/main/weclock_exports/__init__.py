"""
The exports Blueprint handles WeClock export uploading and processing
"""
from flask_restx import Namespace
# weclock_exports_blueprint = Blueprint('weclock_exports', __name__)
weclock_exports_ns = Namespace('exports', description='WeClock Export Uploads')

geo_ns= Namespace('geo', description='location data processing')

from . import export_routes, geo_routes
