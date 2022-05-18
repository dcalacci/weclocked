import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { createEffect, onMount } from "solid-js";
import haversine from 'haversine-distance'
import _ from "lodash";

import { Point, Stop, Stops } from "../weclock/export";
import { unwrap } from "solid-js/store";

const minClusterRadius = 300; // in meters

const buildMap = (args: { mapDiv: HTMLDivElement; startLocation: Point }) => {
  console.log("building map:");
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

const Map = (props: { stops: Stops }) => {
  let mapDiv: any;
  let map: any;

  onMount(() => {
    console.log("Mounting map component...")
    let mapLoc = unwrap(props.stops) ? unwrap(props.stops).avgLoc : { lat: 45, lng: -71 }
    map = buildMap({ mapDiv, startLocation: mapLoc });

    let stops = unwrap(props.stops);
    stops.records.forEach((r: Stop) => {
      console.log("Adding marker:", r);
      L.circle([r.lat, r.lng], { radius: 100 })
        .addTo(map)
        .bindPopup("A pretty CSS3 popup.<br> Easily customizable.");
    });
    let clusterGroups = _.groupBy(stops.records, "clusterID");
    delete clusterGroups['-1'] // remove "noise" cluster
    let avgPoints: { cluster: string; lng: number; lat: number }[] = [];

    _.forIn(clusterGroups, (stops: Stop[], cluster: string) => {
      let lng = _.mean(stops.map((s) => s.lng));
      let lat = _.mean(stops.map((s) => s.lat));
      avgPoints.push({ cluster, lng, lat });
    });

    avgPoints.forEach(({ cluster, lng, lat }) => {
      let points = clusterGroups[cluster]
      let avgDist = _.mean(_.map(points, (p) => (haversine({ lng, lat }, p))))
      console.log("Adding cluster average markers:", cluster, lng, lat);
      L.circle([lat, lng], { radius: _.max([avgDist, minClusterRadius]) }).addTo(map).bindPopup(`Cluster ${cluster}`);
    });

  })

  return (
    <div class="container-full h-96">
      <h1 class="font-bold text-xl">Map</h1>
      <div class="h-full" ref={mapDiv} id="main-map"></div>
    </div>
  );
};

export default Map;
