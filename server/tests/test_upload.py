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
