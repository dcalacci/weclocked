import { createUniqueId, createContext, useContext } from "solid-js";
import type { Component, Context } from 'solid-js';
import { createStore } from "solid-js/store";

// represents a collection of file exports from a single WeClock user
export class WeClockExport {
  identifier: string; // identifier for this user/worker/etc
  files: File[]; // array of export files uploaded by the user
  notes: string; // text notes on this export

  //TODO: Expand as we need additional context or information from exports

  constructor(files: File[] = []) {
    this.identifier = createUniqueId()
    this.files = files
    this.notes = ''
  }
}

export interface ExportState {
  dataExport: WeClockExport
}

export const ExportsContext: Context<[ExportState, any]> = createContext([{ dataExport: new WeClockExport() }, {}])

// This provider allows you to wrap components in <ExportsProvider> and get access to the global store below
export const ExportsProvider: Component = (props) => {
  const [state, setState] = createStore<ExportState>(
    { dataExport: new WeClockExport() }
  )

  const store: [ExportState, Object] = [
    //@ts-ignore this issue. it complains about File[] being mutable. The alternative is FileList,
    // but that makes no sense. Should be fine.
    state,
    {
      // sets the export files using the files arg
      setExportFiles: (files: File[]) => {
        const dataExport: WeClockExport = new WeClockExport(files)
        setState("dataExport", dataExport)
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
