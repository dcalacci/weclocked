import "leaflet/dist/leaflet.css";
import L, { Layer, LayerGroup, Popup } from "leaflet";
import { createEffect, createMemo, createSignal, Match, on, onMount, Show, Switch } from "solid-js";
import haversine from 'haversine-distance'
import _ from "lodash";

import { Cluster, Locs, Point, Stop, Stops } from "../weclock/export";
import { unwrap } from "solid-js/store";

const minClusterRadius = 400; // in meters

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

let map: any;
const Map = (props:
  {
    stops: Stops,
    locs: Locs,
    clusters: Cluster[],
    selectedCluster: number | undefined,
    selectedParticipant: string
  }) => {
  let mapDiv: any;
  let layerGroup: LayerGroup = L.layerGroup();

  const showMap = createMemo(() => props.stops && props.locs && (props.stops.records.length > 0 || props.locs.records.length > 0))

  createEffect(() => {
    let clusterID = props.selectedCluster
    console.log("selected cluster:", clusterID)
    if (clusterID == undefined) {
      map && map.flyTo(L.latLng(props.stops.avgLoc), 12)
    } else {
      console.log(props.clusters)
      let c = _.find(props.clusters, (c) => c.id == clusterID) as Cluster
      if (c) {
        console.log("flying...")
        map && map.flyTo(L.latLng(c.centroid.lat, c.centroid.lng), 15)
      }
    }
  })

  createEffect(() => {
    console.log("Mounting map component...")
    let mapLoc = unwrap(props.stops) ? unwrap(props.stops).avgLoc : { lat: 45, lng: -71 }
    if (!map && showMap()) map = buildMap({ mapDiv, startLocation: mapLoc });

    let locs = unwrap(props.locs);
    let locLayer: Layer[] = []
    if (locs) {
      props.locs.records.forEach((p: Point) => {
        locLayer.push(L.circle([p.lat, p.lng], { radius: 25, color: 'blue', weight: 1 })
          .bindPopup(`Stopped here at ${p.datetime}`));
      });
    }

    let stops = unwrap(props.stops);
    let stopLayer: Layer[] = []
    if (stops) {
      // render stops
      stops.records.forEach((r: Stop) => {
        stopLayer.push(L.circle([r.lat, r.lng], { radius: 100, color: 'gray' })
          .bindPopup(`Stopped here at ${r.datetime} to ${r.leaving_datetime}`))
      });

    }

    let clusters = unwrap(props.clusters);
    let clusterLayer: Layer[] = []
    if (clusters) {
      clusters.forEach((c: Cluster) => {
        let colors = {
          'home': '#A3E635',
          'work': '#FB923C',
          'other': '#38BDF8'
        }
        let color = _.get(colors, c.label, "#38BDF8")
        clusterLayer.push(L.circle([c.centroid.lat, c.centroid.lng],
          {
            radius: _.max([c.avgDist, minClusterRadius]),
            color: color,
            weight: props.selectedCluster && c.id == props.selectedCluster ? 5 : 3
          })
          .bindPopup(`Cluster ${c.id + 1}. \n Stopped here ${c.nStops} times.`));
      })
    }

    if (map) {
      layerGroup.clearLayers()
      let layers = [locLayer, clusterLayer, stopLayer].flat()
      layerGroup = L.layerGroup(layers)
      layerGroup.addTo(map)
    }
  })

  const NoDataMap = () => (
    <div class="flex flex-col h-96 bg-gray-200 items-center justify-center">
      <h1 class="text-xl font-semibold">No Map Data</h1>
    </div>
  )


  return (
    <div class="w-full h-48 lg:h-96 mx-0 px-0 pt-0 mt-0">
      <Show when={showMap()} fallback={NoDataMap}>
        <div class="h-full" ref={mapDiv} id="main-map"></div>
      </Show >
    </div >
  );
};

export default Map;
