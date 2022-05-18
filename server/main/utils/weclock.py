import pandas as pd
import numpy as np
from skmob import TrajDataFrame
import datasheets
from human_id import generate_id

class WeClockExport:
    def __init__(self, identifier, filename_or_file):
        self.identifier = identifier
        self.filename_or_file = filename_or_file
        self.df = self.parse_export_file(self.filename_or_file)

    def parse_export_file(self, filename_or_file) -> pd.DataFrame:
        df = (pd.read_csv(filename_or_file,
                        names = np.array(["idx", "id", "type", "date", "time", "value1", "value2"]),
                        parse_dates=[['date', 'time']]
                         )
              .drop(['id'], axis=1)
             )
        return df

    def geo_df(self) -> pd.DataFrame:
        geodf = (self.df
            .query("type == 'geologging'")
            .assign(value1 = lambda x: pd.to_numeric(x.value1, errors='coerce'))
            .drop(['idx'], axis=1)
            .rename(columns={'value1': "lat", "value2": "lng", "date_time": "datetime"})
            .assign(datetime = lambda x: pd.to_datetime(x.datetime))
            )
        return geodf

    # use .2 because it seems to work well heuristically. Can change in client if needed
    def get_clusters(self, cluster_radius=.2, min_stops=2) -> TrajDataFrame:
        from . import geo
        # uses geo.cluster_stops to get a Data Frame with a new column for clusters
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


