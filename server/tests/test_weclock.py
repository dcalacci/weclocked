import pytest
from pathlib import Path
from main.utils.weclock import WeClockExport

resources = Path(__file__).parent / "resources"

@pytest.fixture(scope='session')
def wc():
    wc = WeClockExport((resources / "data.csv"))
    wb_info = wc.to_google_sheet()
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
    assert wc.workbook.url is not None

def test_tabs_for_each_dtype(wc):
    tab_df = wc.workbook.fetch_tab_names()
    tabnames = list(tab_df['Tabs'])
    assert 'All Data' in tabnames
    assert 'Battery Reading' in tabnames

def test_workbook_is_shared_with_email(wc):
    wc.share_sheet("dcalacci@media.mit.edu")
    shared_df = wc.workbook.fetch_permissions()
    assert shared_df is not None
    assert 'dcalacci@media.mit.edu' in list(shared_df['email'])

# def test_workbook_is_accessible_by_email(wc):
    # TODO
