from flask_restx import Resource
from . import weclock_exports_ns as ns
from werkzeug.datastructures import FileStorage
from ..utils.weclock import WeClockExport
from ..utils.strings import ErrorStrings
from email_validator import validate_email, EmailNotValidError


upload_parser = ns.parser()
upload_parser.add_argument('file', 
                           location = 'files',
                           type = FileStorage,
                           required = True,
                           help = "WeClock export upload.")
upload_parser.add_argument('email', 
                           type = str,
                           required = True,
                           help = "Email to share parsed data with.")
upload_parser.add_argument('dry_run', 
                           type = bool,
                           required = False,
                           help = "If True, does not create a google sheet or share with email.")



@ns.route('/upload/')
@ns.expect(upload_parser)
class Upload(Resource):
    def post(self):
        args = upload_parser.parse_args()
        uploaded_file = args['file']
        email = args['email']
        dry_run = False
        if 'dry_run' in args and args['dry_run']:
            dry_run = True

        try:
            valid = validate_email(email)
            email = valid.email
        except EmailNotValidError as e:
            return {
                "message": str(e)
            }, 400 
        
        try:
            wc = WeClockExport(uploaded_file)
        except Exception as e: 
            return {
                "message": ErrorStrings.bad_file
            }, 400

        if dry_run:
            return {
                'wb_info': {'url': 'https://sheets.google.com/fake/sheet'},
                'upload': 'complete'
            }
        else:
            try:
                wb_info = wc.to_google_sheet()
                wc.share_sheet(email)
                return {
                    'wb_info': wb_info,
                    'upload': 'complete'
                }, 201
            except Exception as e:
                return {
                    "message": ErrorStrings.sheet_issue
                }, 500
        
