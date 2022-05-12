import { createUniqueId, createContext, useContext } from "solid-js";
import type { Component, Context } from 'solid-js';
import { createStore } from "solid-js/store";

// represents a collection of file exports from a single WeClock user
// let f = new FileList()

export class WeClockExport {
  identifier: string;
  files: File[];
  notes: string;

  // TODO: I use FileList here because otherwise, File[] is a mutable type and we cannot use 
  // it in a Solid-js provider
  constructor(files: File[] = []) {
    // constructor(files: FileList = (new FileList())) {
    this.identifier = createUniqueId()
    this.files = files
    this.notes = ''
  }
}

export interface ExportState {
  dataExport: WeClockExport // exports with details
}

export const ExportsContext: Context<[ExportState, any]> = createContext([{ dataExport: new WeClockExport() }, {}])

export const ExportsProvider: Component = (props) => {
  const [state, setState] = createStore<ExportState>(
    { dataExport: new WeClockExport() }
  )

  const store: [ExportState, Object] = [
    state,
    {
      // sets the export files using the files arg
      setExportFiles: (files: File[]) => {
        const dataExport: WeClockExport = new WeClockExport(files)
        setState("dataExport", dataExport)
        console.log("Setting data export...", files)
      }
    }
  ]

  return (
    <ExportsContext.Provider value={store}>
      {props.children}
    </ExportsContext.Provider>
  )
}

export function useExports() { return useContext(ExportsContext); }
