import {
  createEffect,
  createResource,
  createSignal,
  Match,
  on,
  Switch,
} from "solid-js";
import axios, { AxiosError } from "axios";
import { Cluster, Stop, UploadData, WeClockExport } from "../weclock/export";
import { ProgressSpinner } from "../components";
import { useExports } from "../weclock/ExportProvider";
import haversine from 'haversine-distance'
import _ from "lodash";

export default (props: {
  exports: WeClockExport[];
  email: string;
  setError: (err: string) => void;
  onUploaded: () => void;
}) => {
  const [uploadPercent, setUploadPercent] = createSignal(0);
  const [uploadData, setUploadData] = createSignal<{
    exports: WeClockExport[];
    email: string;
  }>({ exports: [], email: "" });

  const [exportState, { setStore }] = useExports();

  const onUploadProgress = (event: ProgressEvent) => {
    const percentage = Math.round((100 * event.loaded) / event.total);
    setUploadPercent(percentage);
  };

  async function uploadExports(source: {
    exports: WeClockExport[];
    email: string;
  }): Promise<UploadData | undefined> {
    if (source.exports.length == 0) return undefined;
    const exports = source.exports;
    const email = source.email;
    const formData = new FormData();

    const files: File[] = [];
    const identifiers: string[] = [];

    exports.forEach((e) => {
      files.push(...e.files);
      // repeat 'identifier' for each file
      let idents = Array.from(
        { length: e.files.length },
        () => e.identifier
      ).flat();
      identifiers.push(...idents);
    });

    Array.from(files).forEach((f: File) => {
      formData.append("files", f);
    });
    formData.append("identifiers", identifiers.join("|"));
    formData.append("email", email);
    try {
      //TODO: change to server URL
      const response = await axios.post(
        "http://localhost:5000/exports/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress,
        }
      );
      if (response.data.wb_info) {
        return response.data;
      }
    } catch (err) {
      const errors = err as Error | AxiosError;
      if (axios.isAxiosError(errors)) {
        props.setError("Error uploading exports: " + errors.message);
        console.log("Something wrong with the request");
      } else {
        props.setError("Error uploading exports: " + errors.message);
        console.log("Some other error, oops");
      }
    }
    return undefined;
  }

  const [data, { mutate, refetch }] = createResource<
    UploadData | undefined,
    { exports: WeClockExport[]; email: string }
  >(uploadData, uploadExports);

  createEffect(
    on(data, (d) => {
      if (d) {
        props.onUploaded();
        setStore('locs', d.data.all_locations);
        setStore('stops', d.data.clusters);

        // post-process and set cluster data
        let allStops = d.data.clusters // confusing but this is stops
        let clusterData: Cluster[] = []
        allStops.forEach((s) => {
          let stops = s.records
          let clusterGroups = _.groupBy(stops, "clusterID");
          delete clusterGroups['-1'] // remove "noise" cluster
          let avgPoints: { cluster: string; lng: number; lat: number }[] = [];
          console.log("processing clusters:", clusterGroups)

          // render clusters as blue circles
          _.forIn(clusterGroups, (stops: Stop[], cluster: string) => {
            let lng = _.mean(stops.map((s) => s.lng));
            let lat = _.mean(stops.map((s) => s.lat));
            let timesInCluster = stops.map((s) => [new Date(s.datetime), new Date(s.leaving_datetime)])
            let totalTime = _.sum(_.map(timesInCluster, (([start, end]: Date[][]) => Math.abs(end - start) / 36e5)))
            let avgDist = _.mean(_.map(stops, (p) => (haversine({ lng, lat }, p))))

            clusterData.push({
              id: parseInt(cluster),
              identifier: s.identifier,
              avgDist,
              centroid: { lng, lat },
              label: cluster,
              nStops: stops.length,
              totalTime,
              timesInCluster
            })
          });
        })
        setStore('clusters', clusterData)

      }
    })
  );

  return (
    <Switch>
      <Match when={props.exports.length >= 1}>
        <p
          onClick={() =>
            setUploadData({ exports: props.exports, email: props.email })
          }
          class="transition 
							text-center
							ease-in 
							shadow-md
							border-green-400
							border-2
							cursor-pointer 
							font-semibold
							rounded-sm
							hover:shadow-md
							hover:bg-green-200 
							hover:text-slate-700
							active:bg-green-300 
							active:shadow-sm
								my-5
								p-4"
        >
          Process Exports
        </p>
      </Match>
      <Match when={data.loading}>
        <ProgressSpinner percent={uploadPercent()} />
      </Match>
      <Match when={!data.loading && data()}>
        <p
          class="
        transition ease-in
        p-2
        rounded-sm
        border-4
        border-emerald-600
        bg-emerald-500
        text-white
        font-semibold
        text-center
        "
        >
          Done!
        </p>
        <a href={data()!.wb_info?.url}>
          <p
            class="
        transition ease-in
        m-2
        p-2
        rounded-sm
        border-4
        text-slate-500
        font-semibold
        text-center
        border-slate-500
        "
          >
            Go To Google Sheet
          </p>
        </a>
        <a href={"/label"}>
          <p
            class="
        transition ease-in
        m-2
        p-2
        rounded-sm
        border-4
        text-slate-500
        font-semibold
        text-center
        border-slate-500
        "
          >
            Next
          </p>
        </a>
      </Match>
    </Switch>
  );
};


