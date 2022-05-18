import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { createEffect, createMemo, Match, onMount, Show, Switch } from "solid-js";
import haversine from 'haversine-distance'
import _ from "lodash";

import { Locs, Point, Stop, Stops } from "../weclock/export";
import { unwrap } from "solid-js/store";

const minClusterRadius = 300; // in meters

const buildMap = (args: { mapDiv: HTMLDivElement; startLocation: Point }) => {
  const map = L.map(args.mapDiv).setView(
    [args.startLocation.lat, args.startLocation.lng],
    12
  );

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  return map;
};

const Map = (props: { stops: Stops, locs: Locs }) => {
  let mapDiv: any;
  let map: any;

  const showMap = createMemo(() => props.stops && props.locs && (props.stops.records.length > 0 || props.locs.records.length > 0))

  // createEffect(() => {
  //   if (!showMap())
  //     if (map) map.remove()
  // })

  createEffect(() => {
    console.log("Mounting map component...")
    let mapLoc = unwrap(props.stops) ? unwrap(props.stops).avgLoc : { lat: 45, lng: -71 }
    if (map != undefined) {
      map.remove()
      map = undefined;
    }
    if (!map && showMap()) map = buildMap({ mapDiv, startLocation: mapLoc });


    let locs = unwrap(props.locs);
    if (locs) {
      props.locs.records.forEach((p: Point) => {
        L.circle([p.lat, p.lng], { radius: 25, color: 'blue', weight: 1 })
          .addTo(map)
          .bindPopup(`Stopped here at ${p.datetime}`);
      });
    }

    let stops = unwrap(props.stops);
    if (stops) {
      // render stops
      stops.records.forEach((r: Stop) => {
        L.circle([r.lat, r.lng], { radius: 100, color: 'gray' })
          .addTo(map)
          .bindPopup(`Stopped here at ${r.datetime} to ${r.leaving_datetime}`);
      });

      let clusterGroups = _.groupBy(stops.records, "clusterID");
      delete clusterGroups['-1'] // remove "noise" cluster
      let avgPoints: { cluster: string; lng: number; lat: number }[] = [];

      // render clusters as blue circles
      _.forIn(clusterGroups, (stops: Stop[], cluster: string) => {
        let lng = _.mean(stops.map((s) => s.lng));
        let lat = _.mean(stops.map((s) => s.lat));
        avgPoints.push({ cluster, lng, lat });
      });

      avgPoints.forEach(({ cluster, lng, lat }) => {
        let points = clusterGroups[cluster]
        let avgDist = _.mean(_.map(points, (p) => (haversine({ lng, lat }, p))))
        L.circle([lat, lng], { radius: _.max([avgDist, minClusterRadius]) })
          .addTo(map)
          .bindPopup(`Cluster ${cluster}. \n Stopped here ${points.length} times.`);
      });

    }

  })

  const NoDataMap = () => (
    <div class="flex flex-col h-96 bg-gray-200 items-center justify-center">
      <h1 class="text-xl font-semibold">No Map Data</h1>
    </div>
  )


  return (
    <div class="container-full h-96">
      <h1 class="font-bold text-xl">Map</h1>
      <Show when={showMap()} fallback={NoDataMap}>
        <div class="h-full" ref={mapDiv} id="main-map"></div>
      </Show >
    </div >
  );
};

export default Map;
