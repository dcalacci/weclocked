import type { Component } from 'solid-js'

import { createSignal } from "solid-js";
import { useExports, WeClockExport } from '../weclock/export'


const FileItem = (props: { children?: Element, fileId: string }) => {
  const [identifier, setIdentifier] = createSignal<string>("")
  const [notes, setNotes] = createSignal<string>("")


  return (
    <div class="flex justify-center">
      <p> Export ID: {props.fileId}</p>
    </div>
  )
}

export default () => {

  const [exportState, { setExportFiles }] = useExports();
  return (
    <div class="flex justify-center">
      <p>Export List</p>
    </div>
  )
}

export {
  FileItem,
}
