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
