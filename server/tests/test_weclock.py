import pytest
from pathlib import Path
from main.utils.weclock import WeClockExport

resources = Path(__file__).parent / "resources"

@pytest.fixture
def wc():
    wc = WeClockExport((resources / "data.csv"))
    return wc

def test_good_csv_can_be_read_by_pandas(wc):
    assert wc.df is not None
    assert wc.df.iloc[0].type == 'battery reading'
    assert wc.df.iloc[0].value1 == '88.0%'
    assert len(wc.df) == 336

def test_geo_csv_extracted_successfully(wc):
    gdf = wc.geo_df()
    assert all([t == 'geologging' for t in gdf.type])
    assert gdf.value1.dtype == float
    assert gdf is not None

def test_upload_to_google_sheets(wc):
    wb_url = wc.to_google_sheet()
    print(wb_url)
    assert wb_url is not None

def test_workbook_is_shared_with_email(wc):
    wb_url = wc.to_google_sheet()
    wc.share_sheet("dcalacci@media.mit.edu")
    shared_df = wc.workbook.fetch_permissions()
    assert shared_df is not None
    assert 'dcalacci@media.mit.edu' in list(shared_df['email'])

