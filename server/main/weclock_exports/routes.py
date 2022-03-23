from flask_restx import Resource
from . import weclock_exports_ns as ns
from werkzeug.datastructures import FileStorage

import time

upload_parser = ns.parser()
upload_parser.add_argument('file', 
                           location = 'files',
                           type = FileStorage,
                           required = True)

@ns.route('/upload/')
@ns.expect(upload_parser)
class Upload(Resource):
    def post(self):
        args = upload_parser.parse_args()
        print("args:", args)
        uploaded_file = args['file']
        print("uploaded file:", uploaded_file)
        time.sleep(5)
        return {'upload': 'complete'}, 201

    def get(self):
        return "Hi!!!"
