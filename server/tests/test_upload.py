from conftest import client
from pathlib import Path

resources = Path(__file__).parent / "resources"

def test_upload_csv_returns_response(client):
    resp = client.post("/exports/upload/", data={
                           "name": "file",
                           "file": (resources / "data.csv").open('rb')
                       })
    print("response:", resp)
    assert resp is not None

# def test_upload_with_no_email_returns_error(client):
    # TODO

# def test_upload_with_badly_formatted_file_returns_error(client):

# def test_upload_with_non_csv_returns_error(client):

# def test_upload_with_multiple_files_creates_one_sheet(client):

# def test_upload_with_bad_email_returns_error(client):
