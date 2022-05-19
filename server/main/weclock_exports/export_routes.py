from flask_restx import Resource
from . import weclock_exports_ns as ns
from werkzeug.datastructures import FileStorage
from ..utils.weclock import WeClockExport


upload_parser = ns.parser()
upload_parser.add_argument(
    "files", location="files", type=FileStorage, action="append", required=True
)
upload_parser.add_argument("identifiers", type=str, required=True)
upload_parser.add_argument("email", type=str, required=True)
upload_parser.add_argument("to_google_sheet", type=bool, required=False)


@ns.route("/upload")
@ns.expect(upload_parser)
class Upload(Resource):
    def post(self):
        args = upload_parser.parse_args()
        uploaded_files = args["files"]
        identifiers = args["identifiers"].split("|")
        email = args["email"]

        print("Recieved args:", args)

        if len(uploaded_files) != len(identifiers):
            return {
                "message": "The number of files and identifiers must be the same"
            }, 400

        # group uploaded files by identifiers
        files_by_identifier = {}
        for i in range(len(uploaded_files)):
            if identifiers[i] in files_by_identifier:
                files_by_identifier[identifiers[i]].append(uploaded_files[i])
            else:
                files_by_identifier[identifiers[i]] = [uploaded_files[i]]

        # check if the same identifier is used more than once
        identifiers_set = set(identifiers)
        if len(identifiers_set) != len(identifiers):
            return {"message": "Identifiers must be unique"}, 400

        # check if the same file is used more than once
        for identifier in files_by_identifier:
            files_set = set(files_by_identifier[identifier])
            if len(files_set) != len(files_by_identifier[identifier]):
                return {"message": "Files must be unique"}, 400

        # create WeClockExports
        # TODO: an export can represent multiple files
        weclock_exports = []
        for identifier in files_by_identifier:
            weclock_exports.append(
                WeClockExport(identifier, files_by_identifier[identifier][0])
            )

        cluster_payload = []
        geo_payload = []

        for weclock_export in weclock_exports:
            # get the clusters
            cluster_df = weclock_export.get_clusters()
            if len(cluster_df) == 0:
                cluster_payload.append(
                    {
                        "identifier": weclock_export.identifier,
                        "records": [],
                        "avgLoc": None
                    }
                )
                geo_payload.append(
                    {
                        "identifier": weclock_export.identifier,
                        "records": []
                    }
                )
                continue
            formatted_df = cluster_df.assign(
                datetime=lambda x: x.datetime.astype("str"),
                leaving_datetime=lambda x: x.leaving_datetime.astype("str"),
            )

            avg = cluster_df[["lng", "lat"]].mean().to_dict()

            cluster_payload.append(
                {
                    "identifier": weclock_export.identifier,
                    "records": formatted_df.to_dict(orient="records"),
                    "avgLoc": avg,
                }
            )

            # get all locations
            gdf = weclock_export.geo_df().assign(
                datetime=lambda x: x.datetime.astype("str"),
            )

            geo_payload.append(
                {
                    "identifier": weclock_export.identifier,
                    "records": gdf.to_dict(orient="records"),
               })

        # TODO: should be one google sheet, right?
        # payload = {
        # }
        # # upload to google sheets
        # if args['to_google_sheet']:
        #     for wc in weclock_exports:
        #         wb_info = wc.to_google_sheet()
        # wc.share_sheet('dcalacci@media.mit.edu')
        #         payload['urls'].append(wb_info)

        wb_info = {"url": "fake-url"}
        return {
            "wb_info": wb_info,
            "upload": "complete",
            "data": { "clusters": cluster_payload, "all_locations": geo_payload },
            "message": "Files uploaded.",
        }, 201

    def get(self):
        return "Hi!!!"
