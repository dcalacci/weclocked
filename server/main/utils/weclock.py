import pandas as pd

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

