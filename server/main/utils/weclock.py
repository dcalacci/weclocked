import pandas as pd
import datasheets
from human_id import generate_id
class WeClockExport:
    def __init__(self, filename):
        self.filename = filename
        self.df = self.parse_export_file(self.filename)

    def parse_export_file(self, filename):
        df = (pd.read_csv(filename,
                        names = ["idx", "id", "type", "date", "time", "value1", "value2"],
                        parse_dates=[['date', 'time']]
                         )
              .drop(['id'], axis=1)
             )
        return df

    def geo_df(self):
        geodf = (self.df
            .query("type == 'geologging'")
            .assign(value1 = lambda x: pd.to_numeric(x.value1, errors='coerce'))
            .drop(['idx'], axis=1)
            )
        return geodf

    def to_google_sheet(self):
        client = datasheets.Client(service=True)
        wb_id = generate_id()
        self.workbook = client.create_workbook(wb_id)
        tab = self.workbook.create_tab('all_data')
        tab.insert_data(self.df, index=False)
        return {'url': self.workbook.url, 'name': wb_id}

    def share_sheet(self, email):
        self.workbook.share(email=email,
                            role='writer',
                            notify=True,
                            message="Your WeClock export is ready for you to view!")


