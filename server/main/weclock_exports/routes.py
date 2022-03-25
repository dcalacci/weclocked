from flask_restx import Resource
from . import weclock_exports_ns as ns
from werkzeug.datastructures import FileStorage
from ..utils.weclock import WeClockExport

import time

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
        print("upload file", uploaded_file)
        
        wc = WeClockExport(uploaded_file)
        wb_info = wc.to_google_sheet()
        wc.share_sheet('dcalacci@media.mit.edu')
        return {'wb_info': wb_info,
            'upload': 'complete'}, 201

    def get(self):
        return "Hi!!!"
