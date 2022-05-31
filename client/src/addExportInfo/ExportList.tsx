import { createEffect, createMemo, on, Show } from "solid-js";

import { For } from "solid-js";
import { createSignal } from "solid-js";
import { useExports } from "../weclock/ExportProvider";

import { Cluster, Locs, Stops } from "../weclock/export";

import { HiSolidEye } from 'solid-icons/hi'

import ToggleButton from '../components/ToggleButton'
import Map from "./Map";
import _ from "lodash";

const Labeler = () => {
  const [exportState, { setStore }] = useExports();
  const [selectedParticipant, setSelectedParticipant] = createSignal<string>(exportState.exports[0].identifier)
  const [selectedCluster, selectCluster] = createSignal<number | null>(null)

  const [showClusters, setShowClusters] = createSignal<boolean>(true)
  const [showPoints, setShowPoints] = createSignal<boolean>(false)
  const [showStops, setShowStops] = createSignal<boolean>(false)

  // select first cluster for new participant
  createEffect(on(selectedParticipant, () => {
    selectCluster(0)
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

  const labelCluster = (id: number, label: string) => {
    console.log("labeling cluster ", id, label)
    setStore(
      'clusters',
      (c: Cluster) => c.identifier == selectedParticipant() && c.id == id,
      'label',
      label
    )
  }

  return (
    <div class="flex-col content-center justify-center w-full h-full md:pb-16">

      <Map
        class="h-1/3"
        stops={stops() as Stops}
        locs={locs() as Locs}
        clusters={clusters() as Cluster[]}
        selectedCluster={selectedCluster()}
        selectedParticipant={selectedParticipant()}
        showPoints={showPoints()}
        showStops={showStops()}
        showClusters={showClusters()}
      />

      <div class="grid grid-cols-1 grid-flow-row h-2/3 md:grid-cols-2 overflow-y-scroll">
        <div class="order-1 col-span-1 flex-shrink border-black border-b-2 content-center justify-between pt-1 px-2">
          <div class="flex flex-row flex-grow justify-between">
            <h1 class="text-xl font-semibold py-2">{selectedParticipant() ? selectedParticipant() : "No Participant Selected"}</h1>
            <ParticipantSelector participants={exportState.exports.map((e) => e.identifier)} onSelectParticipant={(p) => setSelectedParticipant(p)} />
          </div>
        </div>
        <div class="order-2 col-span-1 flex-row justify-center px-2 pt-2 border-b-2 border-black">
          <HourStats participantID={selectedParticipant()} />
        </div>

        {/* clusters */}
        <div class="order-3 md:overflow-y-scroll row-span-2 col-span-1 flex flex-col px-2 pt-2">
          <div class="flex flex-row items-center justify-between pb-2 border-b-2">
            <h1 class="text-xl font-semibold">Clusters</h1>
            <button class="flex flex-row items-center p-1 border-2 rounded-md shadow-md hover:bg-black hover:text-white hover:font-semibold"
              onClick={() => selectCluster(null)}
            >
              <HiSolidEye class="h-5 w-5 mx-1" />
              Reset View
            </button>
          </div>


          <div>
            <For each={clusters() as Cluster[]}>
              {(c) => (
                <div
                  class={`${selectedCluster() == c.id ? 'shadow-xl border-double' : ''} flex-row justify-center border-2 border-black p-2 my-2 rounded-xl`}>
                  <div class="flex flex-row items-center justify-between">
                    <h1 class="text-lg font-semibold underline pr-2">Cluster {c.id + 1}</h1>

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
        <div class="col-span-1 row-span-1 order-4">
          <div class="flex flex-col items-start">
            <ToggleButton label={"Toggle Clusters"} onSetToggle={setShowClusters} toggleState={showClusters()} />
            <ToggleButton label={"Toggle Stops"} onSetToggle={setShowStops} toggleState={showStops()} />
            <ToggleButton label={"Toggle Points"} onSetToggle={setShowPoints} toggleState={showPoints()} />
          </div>
        </div>
        <div class="col-span-1 row-span-1 order-5 h-16" />
      </div >
    </div>
  );
};

const HourStats = (props: { participantID: string }) => {
  const [exportState] = useExports();

  const clusters = createMemo(() => {
    return exportState.clusters.filter((c) => c.identifier == props.participantID) || []
  })

  const hoursWorked = createMemo(() => {
    let clusterGroups = _.groupBy(clusters(), 'label')
    console.log("cluster groups:", clusterGroups)
    let timeInLabel = _.mapValues(clusterGroups, (v) => {
      return _.sum(_.map(v, (c) => c.totalTime))
    })
    return timeInLabel
  })

  return (
    <div class="flex flex-row justify-around w-full">
      <div class="flex flex-col items-center">
        <p class='font-bold'>{hoursWorked().work ? hoursWorked().work.toFixed(1) + 'h' : '?'}</p>
        <p class="flex text-sm">Work</p>
      </div>
      <div class="flex flex-col items-center">
        <p class='font-bold'>{hoursWorked().home ? hoursWorked().home.toFixed(1) + 'h' : '?'}</p>
        <p class="flex text-sm">Home</p>
      </div>
      <div class="flex flex-col items-center">
        <p class='font-bold'>{hoursWorked().other ? hoursWorked().other.toFixed(1) + 'h' : '?'}</p>
        <p class="flex text-sm">Other</p>
      </div>
    </div>

  )
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
              {(p) => (
                <a href="#" onClick={() => { setSelected(false); props.onSelectParticipant(p) }} class="text-gray-700 block px-4 py-2 text-sm" role="menuitem" tabindex="-1" id="menu-item-0">{p}</a>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  )
}

export { Labeler };
