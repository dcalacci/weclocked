import type { Component } from "solid-js";

import { For } from "solid-js";
import { createSignal, useContext } from "solid-js";
import { unwrap } from "solid-js/store";
import { useExports, ExportsContext } from "../weclock/ExportProvider";

import { WeClockExport } from "../weclock/export";

const FileItem = (props: { children?: Element; fileId: string }) => {
  const [identifier, setIdentifier] = createSignal<string>("");
  const [notes, setNotes] = createSignal<string>("");

  return (
    <div class="flex-row justify-center border-black">
      <div class="flex">
        <p> Export ID: {props.fileId}</p>
        <p> Identifier: {identifier}</p>
      </div>
    </div>
  );
};

export default () => {
  console.log("export list...");
  const [exportState, { setExportFiles }] = useExports();
  console.log("export state:", unwrap(exportState));
  return (
    <div class="flex-col justify-center w-full">
      <For each={exportState.dataExport.files}>
        {(f: File) => <FileItem fileId={f.name}></FileItem>}
      </For>
    </div>
  );
};

export { FileItem };
