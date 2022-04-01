from flask_restx import Resource
from . import weclock_exports_ns as ns
from werkzeug.datastructures import FileStorage
from ..utils.weclock import WeClockExport
from email_validator import validate_email, EmailNotValidError


upload_parser = ns.parser()
upload_parser.add_argument('file', 
                           location = 'files',
                           type = FileStorage,
                           required = True)
upload_parser.add_argument('email', 
                           type = str,
                           required = True)

@ns.route('/upload/')
@ns.expect(upload_parser)
class Upload(Resource):
    def post(self):
        args = upload_parser.parse_args()
        uploaded_file = args['file']
        email = args['file']

        try:
            valid = validate_email(email)
            email = valid.email
        except EmailNotValidError as e:
            return {
                "message": str(e)
            }, 400 
        
        try:
            wc = WeClockExport(uploaded_file)
            wb_info = wc.to_google_sheet()
            wc.share_sheet(email)
        except Exception as e:
            return {
                "message": "Could not create sheet"
            }, 500
        return {
            'wb_info': wb_info,
            'upload': 'complete'
        }, 201
