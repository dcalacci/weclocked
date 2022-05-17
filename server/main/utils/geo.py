import numpy as np
from skmob import TrajDataFrame
from sklearn.cluster import DBSCAN

kms_per_radian = 6371.0088


def get_trips(
    traj_df, min_trip_dist_mi=1.0, minutes_for_stop=5, no_data_for_minutes=60
):
    from skmob.preprocessing import detection
    import pandas as pd

    stop_df = detection.stay_locations(
        traj_df,
        min_speed_kmh=20.0,
        stop_radius_factor=0.75,
        minutes_for_a_stop=minutes_for_stop,
        spatial_radius_km=1.0,
        no_data_for_minutes=no_data_for_minutes,
    )

    sdf = pd.concat(
        [
            pd.DataFrame(
                traj_df.iloc[0][["lat", "lng", "datetime"]].rename(
                    {"datetime": "leaving_datetime"}
                )
            ).T,
            stop_df,
            pd.DataFrame(traj_df.iloc[-1][["lat", "lng", "datetime"]]).T,
        ]
    ).reset_index(drop=True)

    shifted_df = sdf.copy()
    shifted_df.leaving_datetime = sdf.leaving_datetime.shift()
    intervals = shifted_df[["datetime", "leaving_datetime"]].values

    # extract trajectories within intervals
    trajectories = [
        TrajDataFrame(
            pd.concat(
                [
                    # only include stop in beginning if it's not the first
                    # first stop has a leaving_datetime but not a arrival
                    pd.DataFrame(
                        sdf.iloc[n - 1][["lat", "lng", "leaving_datetime"]]
                    ).T.rename(columns={"leaving_datetime": "datetime"})
                    if n > 0
                    else None,
                    # intermediate trajectory
                    traj_df.set_index("datetime")[i[1] : i[0]].reset_index(),
                    # and the stop that ends this segment
                    pd.DataFrame(sdf.iloc[n][["lat", "lng", "datetime"]]).T,
                ]
            ).reset_index(drop=True)
        )
        for n, i in enumerate(intervals)
        if len(traj_df.set_index("datetime")[i[1] : i[0]]) > 1
    ]

    return trajectories, TrajDataFrame(sdf), stop_df


def cluster_stops(tdf, cluster_radius_km, min_samples):
    # From dataframe convert to numpy matrix
    lat_lng_dtime_other = tdf[["lng", "lat", "datetime", "leaving_datetime"]].values
    columns_order = list(tdf.columns)

    labels = _cluster_array(lat_lng_dtime_other, cluster_radius_km, min_samples)
    return tdf.assign(clusterID=labels)


def _cluster_array(lat_lng_dtime_other, cluster_radius_km, min_samples, verbose=False):

    X = np.array([[point[0], point[1]] for point in lat_lng_dtime_other])

    # Compute DBSCAN
    eps_rad = cluster_radius_km / kms_per_radian

    db = DBSCAN(
        eps=eps_rad, min_samples=min_samples, algorithm="ball_tree", metric="haversine"
    )
    clus = db.fit(np.radians(X))
    # core_samples = clus.core_sample_indices_
    labels = clus.labels_

    # Number of clusters in labels, ignoring noise if present.
    n_clusters_ = len(set(labels)) - (1 if -1 in labels else 0)

    # get
    if verbose:
        print("Estimated number of clusters: %d" % n_clusters_)

    return labels


###############
# utils
###############


def meters_to_miles(x):
    return x * 0.0006213712


def clean_trajectory(ex):
    """
    Cleans and filters a list of Location objects, and processes into a TrajDataFrame

    It filters out points that have a max speed of over 500kmh, and compresses trajectory data within a radius of 0.05km.

    Parameters
    ----------
    locs : list
        Locations to clean, filter, and transform into TrajDataFrame

    Returns
    -------
    TrajDataFrame
        Cleaned and filtered trajectory dataframe
    """

    from skmob import TrajDataFrame
    from skmob.preprocessing import filtering

    data = ex.geo_df()[["lng", "lat", "datetime"]]
    # filter and compress our location dataset
    tdf = TrajDataFrame(data, datetime="datetime")
    ftdf = filtering.filter(tdf, max_speed_kmh=500.0)
    print(
        "filtered {} locs from trajectory of length {}".format(
            len(tdf) - len(ftdf), len(tdf)
        )
    )
    print("compressed trajectory is length {}".format(len(tdf)))
    return tdf


def bounding_box(points):
    """
    Computes a bounding box from a list of coordinates

    Parameters
    ----------
    points : list
        List of coordinates in the form of [[x,y], ...]

    Returns
    -------
    list
        A 4-tuple consisting of [xmin, ymin, xmax, ymax]
    """
    x_coordinates, y_coordinates = zip(*points)
    return [
        min(x_coordinates),
        min(y_coordinates),
        max(x_coordinates),
        max(y_coordinates),
    ]


def avg_speed(tdf):
    from skmob.utils import gislib

    """
    Calculate average speed in meters/second of a raw trajectory

    Returns
    -------
    float
        Average speed between points in the given TrajDataFrame in m/s.
    """
    temp_df = tdf.copy()
    temp_df["prev_lat"] = temp_df.lat.shift()
    temp_df["prev_lng"] = temp_df.lng.shift()
    temp_df["dist"] = [
        gislib.getDistance(r[1][["lat", "lng"]], r[1][["prev_lat", "prev_lng"]])
        for r in temp_df.iterrows()
    ]
    temp_df["dt"] = (temp_df.datetime - temp_df.datetime.shift()).apply(
        lambda dt: float(dt.seconds)
    )
    if len(temp_df) == 0:
        return 0.0
    temp_df["speed_ms"] = temp_df["dist"] / temp_df["dt"]
    return temp_df.speed_ms.mean()
