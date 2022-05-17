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

  return (
    <div class="flex-col content-center justify-center w-full p-5">
      <p>Uploaded {exportState.exports.length} files.</p>
      <For each={exportState.exports as WeClockExport[]}>
        {(ex: WeClockExport) => <FileItem fileId={ex.identifier}></FileItem>}
      </For>
    </div>
  );
};

export { FileItem, FileList };
