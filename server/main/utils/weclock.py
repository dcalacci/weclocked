import pandas as pd
import numpy as np
from skmob import TrajDataFrame
import datasheets
from human_id import generate_id
import functools

class WeClockExport:
    def __init__(self, identifier, filename_or_file):
        self.identifier = identifier
        self.filename_or_file = filename_or_file
        self.df = self.parse_export_file(self.filename_or_file)
        self.type = "android"

    def parse_export_file(self, filename_or_file) -> pd.DataFrame:
        # if it's a .zip, it's an android export and needs to be treated differently.
        try:
            if '.zip' in filename_or_file.filename:
                df = pd.read_csv(filename_or_file, compression='zip',
                               names = np.array(["idx", "type", "datetime", "value1", "value2", "value3", "value4", "value5", "fused"]))
                self.type = "android"
                return df
            else: 
                f = filename_or_file
                df = (pd.read_csv(f,
                                names = np.array(["idx", "id", "type", "date", "time", "value1", "value2"]),
                                parse_dates=[['date', 'time']]
                                 )
                      .drop(['id'], axis=1)
                     )
                self.type = "ios"
                return df
        except Exception as e:
            print("error!", e)
            return pd.DataFrame()

    # cache because we call this often
    @functools.cache
    def geo_df(self) -> pd.DataFrame:
        geodf = pd.DataFrame()
        if (self.type == 'ios'):
            geodf = (self.df
                .query("type == 'geologging'")
                .assign(value1 = lambda x: pd.to_numeric(x.value1, errors='coerce'))
                .drop(['idx'], axis=1)
                .rename(columns={'value1': "lat", "value2": "lng", "date_time": "datetime"})
                .assign(datetime = lambda x: pd.to_datetime(x.datetime))
                ).dropna()
        elif (self.type == 'android'):
            geo_df = self.df.query("type == 'geo_logging'")
            geo_df = (pd.concat([
                                   geo_df[['type', 'datetime']],
                                   geo_df['value1'].str.split(',', expand=True)
                               ], axis=1)
                .rename(columns={0: 'lat', 1: 'lng'}))
            print("geo df:")
            print(geo_df)
            geodf = (geo_df
                .rename(columns={'0': 'lat', '1': 'lng'})
                .assign(lat = lambda x: pd.to_numeric(x.lat, errors='coerce'))
                .assign(lng = lambda x: pd.to_numeric(x.lng, errors='coerce'))
                .assign(datetime = lambda x: pd.to_datetime(x.datetime, errors='coerce'))
            ).dropna()
        return geodf

    # use .2 because it seems to work well heuristically. Can change in client if needed
    def get_clusters(self, cluster_radius=.1, min_stops=1) -> TrajDataFrame or None:
        from . import geo
        # uses geo.cluster_stops to get a Data Frame with a new column for clusters
        if (len(self.geo_df()) < 5):
            return TrajDataFrame(pd.DataFrame()) 
        trajectories, sdf, stop_df = geo.get_trips(self.geo_df())
        return geo.cluster_stops(stop_df, cluster_radius, min_stops)


    def caps(self, s): 
        return " ".join([s[0].upper() + s[1:] for s in str(s).split(" ")])

    def to_google_sheet(self, split_tabs=True):
        client = datasheets.Client(service=True)
        wb_id = generate_id()
        self.workbook = client.create_workbook(wb_id)
        all_data_tab = self.workbook.create_tab('All Data')
        all_data_tab.insert_data(self.df, index=False)

        if split_tabs:
            # new tabs for each data type
            dtypes = self.df.type.unique()
            for t in dtypes:
                tabname = self.caps(t)
                tab_df = self.df.query("type == @t")
                if t == 'geologging':
                    tab_df = (tab_df.assign(value1 = lambda x: pd.to_numeric(x.value1, errors='coerce'))
                        .drop(['idx'], axis=1))

                tab = self.workbook.create_tab(tabname)
                tab.insert_data(tab_df, index=False)
            # geo_tab = self.workbook.create_tab('Location')
        # tab.insert_data(self.geo_df(), index=False)
        return {'url': self.workbook.url, 'name': wb_id}

    def share_sheet(self, email):
        self.workbook.share(email=email,
                            role='writer',
                            notify=True,
                            message="Your WeClock export is ready for you to view!")


