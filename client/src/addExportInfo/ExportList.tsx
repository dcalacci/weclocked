import { createEffect, createMemo, Match, on, onMount, Show, Switch } from "solid-js";

import { For } from "solid-js";
import { createSignal } from "solid-js";
import { unwrap } from "solid-js/store";
import { useExports, ExportsContext } from "../weclock/ExportProvider";

import { Locs, Point, Stops, WeClockExport } from "../weclock/export";

import { HiSolidChevronDown } from 'solid-icons/hi'

import Map from "./Map";
import _ from "lodash";

const FileItem = (props: { children?: Element; fileId: string }) => {
  const [identifier, setIdentifier] = createSignal<string>("");

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
  const [exportState, { setExportFiles }] = useExports();
  const [selectedParticipant, setSelectedParticipant] = createSignal<string>(exportState.exports[0].identifier)

  createEffect(on(selectedParticipant, (p: string) => {
    let exp = _.find(exportState.exports, (e) => e.identifier == p)
  }))

  const stops = createMemo(() => {
    return _.find(exportState.stops, (s) => s.identifier == selectedParticipant())
  })

  const locs = createMemo(() => {
    return _.find(exportState.locs, (l) => l.identifier == selectedParticipant())
  })

  onMount(() => {
    console.log("export state:", unwrap(exportState));
  });

  return (
    <div class="flex-col content-center justify-center w-full p-5">

      <div class="flex flex-row content-center justify-between">
        <div class="flex flex-row">
          <h1 class="text-xl font-semibold py-2">{selectedParticipant() ? selectedParticipant() : "No Participant Selected"}</h1>
        </div>
        <ParticipantSelector participants={exportState.exports.map((e) => e.identifier)} onSelectParticipant={(p) => setSelectedParticipant(p)} />
      </div>
      <Map stops={stops() as Stops} locs={locs() as Locs} />

      <p>Uploaded {exportState.exports.length} files.</p>
      <For each={exportState.exports as WeClockExport[]}>
        {(ex: WeClockExport) => <FileItem fileId={ex.identifier}></FileItem>}
      </For>
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
        <div class="origin-top-right right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
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
