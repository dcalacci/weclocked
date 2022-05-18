import { createMemo, onMount, Show } from "solid-js";

import { For } from "solid-js";
import { createSignal } from "solid-js";
import { unwrap } from "solid-js/store";
import { useExports, ExportsContext } from "../weclock/ExportProvider";

import { Point, Stops, WeClockExport } from "../weclock/export";

import Map from "./Map";

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

  const s1 = createMemo(() => {
    console.log("export state:", unwrap(exportState));
    return unwrap(exportState).stops[0];
  });

  onMount(() => {
    console.log("export state:", unwrap(exportState));
  });

  return (
    <div class="flex-col content-center justify-center w-full p-5">
      <Show when={exportState.stops[0] !== undefined}>
        <Map stops={exportState.stops[0] as Stops} />
      </Show>
      <p>Uploaded {exportState.exports.length} files.</p>
      <For each={exportState.exports as WeClockExport[]}>
        {(ex: WeClockExport) => <FileItem fileId={ex.identifier}></FileItem>}
      </For>
    </div>
  );
};

export { FileItem, FileList };
