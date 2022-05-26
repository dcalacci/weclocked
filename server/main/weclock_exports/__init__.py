"""
The exports Blueprint handles WeClock export uploading and processing
"""
from flask_restx import Namespace, cors
from flask_cors import cross_origin
# weclock_exports_blueprint = Blueprint('weclock_exports', __name__)
weclock_exports_ns = Namespace('exports', description='WeClock Export Uploads',
                               decorators=[cross_origin()])

# geo_ns= Namespace('geo', description='location data processing',
#                   decorators=[cors.crossdomain(origin="*"), cross_origin()])

from . import export_routes
