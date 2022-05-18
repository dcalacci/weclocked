import { createEffect, createMemo, Match, on, onMount, Show, Switch } from "solid-js";

import { For } from "solid-js";
import { createSignal, createSelector } from "solid-js";
import { unwrap } from "solid-js/store";
import { useExports, ExportsContext } from "../weclock/ExportProvider";

import { Cluster, Locs, Point, Stop, Stops, WeClockExport } from "../weclock/export";

import { HiSolidChevronDown, HiSolidDotsCircleHorizontal, HiSolidEye, HiSolidPencilAlt } from 'solid-icons/hi'

import Map from "./Map";
import _ from "lodash";

const FileItem = (props: { children?: Element; fileId: string }) => {
  const [identifier, setIdentifier] = createSignal<string>("");

  // <For each={exportState.exports as WeClockExport[]}>
  //   {(ex: WeClockExport) => <FileItem fileId={ex.identifier}></FileItem>}
  // </For>


  return (
    <div class="flex-row justify-center border-4 border-black p-5 m-3">
      <div class="flex-col">
        <p> Export ID: {props.fileId}</p>
        <p> Identifier: {identifier}</p>
      </div>
    </div>
  );
};

const FileList = () => {
  const [exportState, { setStore, setExportFiles }] = useExports();
  const [selectedParticipant, setSelectedParticipant] = createSignal<string>(exportState.exports[0].identifier)
  const [selectedCluster, selectCluster] = createSignal<number>()

  createEffect(on(selectedParticipant, (p: string) => {
    let exp = _.find(exportState.exports, (e) => e.identifier == p)
  }))

  const stops = createMemo(() => {
    return _.find(exportState.stops, (s) => s.identifier == selectedParticipant()) as Stops
  })

  const clusters = createMemo(() => {
    return exportState.clusters.filter((c) => c.identifier == selectedParticipant()) || []
  })

  const locs = createMemo(() => {
    return _.find(exportState.locs, (l) => l.identifier == selectedParticipant())
  })

  onMount(() => {
    console.log("export state:", unwrap(exportState));
  });

  const labelCluster = (id: number, label: string) => {
    console.log("labeling cluster ", id, label)
    setStore(
      'clusters',
      (c: Cluster) => c.identifier == selectedParticipant() && c.id == id,
      'label',
      label
    )
  }

  //TODO: change button highlight on label change
  return (
    <div class="flex-col content-center justify-center w-full">

      <Map
        stops={stops() as Stops}
        locs={locs() as Locs}
        clusters={clusters() as Cluster[]}
        selectedCluster={selectedCluster()}
        selectedParticipant={selectedParticipant()}
      />
      <div class="flex flex-row flex-wrap">
        <div class="flex flex-col w-full md:w-1/3">
          <div class="flex flex-row content-center justify-between pt-1 px-2">

            <div class="flex flex-row">
              <h1 class="text-xl font-semibold py-2">{selectedParticipant() ? selectedParticipant() : "No Participant Selected"}</h1>
            </div>
            <ParticipantSelector participants={exportState.exports.map((e) => e.identifier)} onSelectParticipant={(p) => setSelectedParticipant(p)} />
          </div>

          <div class={`flex flex-col overflow-y-scroll px-2 pt-2 h-1/3 md:h-full border-black border-t-2 border-b-2 shadow-md`}>
            <div class="flex flex-row items-center justify-between">
              <h1 class="text-xl font-semibold">Clusters</h1>
              <button class="flex flex-row items-center p-1 border-2 rounded-md shadow-md hover:bg-black hover:text-white hover:font-semibold"
                onClick={() => selectCluster(null)}
              >
                <HiSolidEye class="h-5 w-5 mx-1" />
                Reset View
              </button>
            </div>
            <For each={clusters() as Cluster[]}>
              {(c, i) => (
                <div
                  class={` ${selectedCluster() == c.id ? 'shadow-xl border-double' : ''} flex-row justify-center border-4 border-black p-2 my-2`}>
                  <div class="flex flex-row items-center justify-between">
                    <h1 class="text-lg font-semibold underline pr-2">Cluster {parseInt(c.id) + 1}</h1>

                    <button class="flex flex-row items-center p-1 border-2 rounded-md shadow-md hover:bg-black hover:text-white hover:font-semibold"
                      onClick={() => selectCluster(c.id)}
                    >
                      <HiSolidEye class="h-5 w-5 mx-1" />
                      View
                    </button>

                  </div>
                  <p class="font-semibold">Total Time: <span>{c.totalTime.toFixed(1)}h</span></p>
                  <div class="flex flex-row align-self-center justify-start pt-2 justify-around">
                    <button onClick={() => labelCluster(c.id, 'work')}
                      class={`${c.label == 'work' ? 'bg-orange-400 decoration-white text-white font-bold' : ''} px-2 flex flex-shrink border border-gray-500 rounded-md shadow-md justify-between p-1 align-self-center bg-white hover:shadow-xl underline underline-offset-2 decoration-orange-400`}>
                      Work
                    </button>
                    <button onClick={() => labelCluster(c.id, 'home')}
                      class={`${c.label == 'home' ? 'bg-green-400 text-white decoration-white font-bold' : ''} px-2 flex flex-shrink border border-gray-500 rounded-md shadow-md justify-between p-1 align-self-center bg-white hover:shadow-xl underline underline-offset-2 decoration-green-400`}>
                      Home
                    </button>

                    <button onClick={() => labelCluster(c.id, 'other')}
                      class={` ${c.label == 'other' ? 'bg-blue-400 text-white decoration-white font-bold' : ''} px-2 flex flex-shrink border border-gray-500 rounded-md shadow-md justify-between p-1 align-self-center bg-white hover:shadow-xl underline underline-offset-2 decoration-blue-400`}>
                      Other
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
        <div class="flex flex-col">
          <h1>Hours Worked</h1>
        </div>
      </div>
    </div >
  );
};

const LabelScreen = () => {
  const [exportState, { setExportFiles }] = useExports();
  const [participantID, setParticipantID] = createSignal(exportState.exports[0].identifier)
}

const ParticipantSelector = (props: { participants: string[], onSelectParticipant: (p: string) => void }) => {
  const [selected, setSelected] = createSignal(false)
  return (
    <div class="relative inline-block text-left">
      <div>
        <button onClick={() => setSelected(!selected())}
          type="button" class="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500" id="menu-button" aria-expanded="true" aria-haspopup="true">
          Select A Participant
          <svg class="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      <Show when={selected()}>
        <div class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
          <div class="py-1" role="none">
            <For each={props.participants}>
              {(p, i) => (
                <a href="#" onClick={() => { setSelected(false); props.onSelectParticipant(p) }} class="text-gray-700 block px-4 py-2 text-sm" role="menuitem" tabindex="-1" id="menu-item-0">{p}</a>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  )
}

export { FileItem, FileList };
