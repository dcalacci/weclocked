from conftest import client, ErrorStrings
from pathlib import Path

resources = Path(__file__).parent / "resources"

def test_upload_csv_returns_response(client):
    resp = client.post("/exports/upload/", data={
                           "name": "file",
                           "email": "dcalacci@media.mit.edu",
                           "file": (resources / "data.csv").open('rb')
                       })
    print("response:", resp)
    assert resp is not None


def test_upload_with_no_email_returns_error(client):
    resp = client.post("/exports/upload/",
                       data = {
                           "name": "file",
                           "file": (resources / "data.csv").open('rb'),
                           "email": None,
                           "dry_run": True
                       })
    assert resp.status_code == 400

def test_upload_with_not_email_returns_error(client):
    resp = client.post("/exports/upload/",
                       data = {
                           "name": "file",
                           "file": (resources / "data.csv").open('rb'),
                           "email": 9082298992,
                           "dry_run": True
                       })
    assert resp.status_code == 400

def test_upload_with_bad_email_domain_returns_error(client):
    resp = client.post("/exports/upload/",
                       data = {
                           "name": "file",
                           "file": (resources / "data.csv").open('rb'),
                           "email": "hi@dcalaccoioioio.net",
                           "dry_run": True
                       })
    assert resp.status_code == 400
    # text should be "domain xxxxx does not exist"
    assert "does not exist" in resp.json['message']

def test_upload_with_non_csv_returns_error(client):
    resp = client.post("/exports/upload/",
                       data = {
                           "name": "file",
                           "file": (resources / "data-bad.csv").open('rb'),
                           "email": "dcalacci@media.mit.edu",
                           "dry_run": True
                       })
    assert resp.status_code == 400
    assert resp.json['message'] == ErrorStrings.bad_file

# TODO: as of now we don't error when it doesn't look like a weClock export
# def test_upload_with_badly_formatted_csv_returns_error(client):
#     resp = client.post("/exports/upload/",
#                        data = {
#                            "name": "file",
#                            "file": (resources / "data-badformat.csv").open('rb'),
#                            "email": "dcalacci@media.mit.edu",
#                            "dry_run": True
#                        })
#     assert resp.status_code == 400
#     assert resp.json['message'] == ErrorStrings.sheet_issue



# def test_upload_with_multiple_files_creates_one_sheet(client):

# def test_upload_with_bad_email_returns_error(client):
