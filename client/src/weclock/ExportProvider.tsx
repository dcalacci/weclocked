import { createContext, useContext } from "solid-js";
import type { Component } from "solid-js";
import { Store } from "solid-js/store";
import { createLocalStore } from "../store";

import { Stops, Locs, WeClockExport, Cluster } from "./export";
import { STORAGE_CONSTANTS } from "../constants";

export type ExportState = Store<{
  exports: WeClockExport[];
  currentExportIndex: number;
  email: string;
  stops: Stops[];
  clusters: Cluster[];
  locs: Locs[];
}>;

export type ExportActions = {
  getExportById: (identifier: string) => WeClockExport | undefined;
  addExport: () => void;
  addFilesToExport: (identifier: string, files: File[]) => void;
  setFiles: (identifier: string, files: File[]) => void;
  setNotes: (identifier: string, notes: string) => void;
  setUserEmail: (email: string) => void;
  updateExportId: (identifier: string, newId: string) => void;
  clearExports: () => void;
  removeExport: (identifier: string) => void;
  setStore: (...args: any) => any;
};

const ExportsContext = createContext<[ExportState, ExportActions]>();

//TODO: when you change participant name before adding files,
// no upload gets processed.
// I've isolated it down to the fact that when an item gets added to the array `exports`, the resulting items don't have reactivity.

// OK, so when an item is created, an object, and it gets added to the 'exports' array, it simply has none of the weird solidjs properties.

// This provider allows you to wrap components in <ExportsProvider> and get access to the global store below
const ExportsProvider: Component = (props) => {
  const [state, setState] = createLocalStore<ExportState>(
    {
      exports: [new WeClockExport([], "Participant 1", "")] as WeClockExport[],
      currentExportIndex: 0,
      email: "",
      stops: [],
      locs: [],
      clusters: [],
    },
    STORAGE_CONSTANTS.EXPORTS_STORAGE_KEY
  );

  const store: [ExportState, ExportActions] = [
    //@ts-ignore this issue. it complains about File[] being mutable. The alternative is FileList,
    // but that makes no sense. Should be fine.
    state,
    {
      // trying t omake this more generalizable
      setStore: (...args) => {
        //@ts-ignore
        setState(...args);
      },
      clearExports: () => {
        setState("exports", [
          new WeClockExport([], "Participant 1", ""),
        ] as WeClockExport[]);
      },
      removeExport: (identifier) => {
        setState(
          "currentExportIndex",
          (i) => Math.min(i - 1, 0)
        )
        setState(
          "exports",
          (exps) => exps.filter((e) => {
            return e.identifier != identifier
          })
        );
      },
      getExportById: (identifier) => {
        let exps = state.exports as WeClockExport[];
        let exp = exps.find((exportObj) => exportObj.identifier === identifier);
        return exp;
      },
      addFilesToExport: (identifier, files) => {
        setState(
          "exports",
          (exp) => exp.identifier == identifier,
          (exp) => new WeClockExport([...exp.files, ...files], exp.identifier, exp.notes)
        );

      },
      addExport: () => {
        setState(
          "exports",
          state.exports.length,
          new WeClockExport([], `Participant ${state.exports.length + 1}`, "")
        );
      },
      setFiles: (identifier, files: File[]) => {
        setState(
          "exports",
          (exp) => exp.identifier == identifier,
          (exp) => new WeClockExport([...files], exp.identifier, exp.notes)
        );
      },
      setUserEmail: (email: string) => {
        setState("email", email);
      },
      setNotes: (identifier, notes) => {
        setState(
          "exports",
          (exp) => exp.identifier == identifier,
          (exp) => new WeClockExport([...exp.files], exp.identifier, notes)
        );
      },

      updateExportId: (identifier, newId) => {
        setState(
          "exports",
          (exp) => exp.identifier == identifier,
          (exp) => new WeClockExport([...exp.files], newId, exp.notes)
        );
      },
    },
  ];

  return (
    <ExportsContext.Provider value={store}>
      {props.children}
    </ExportsContext.Provider>
  );
};
const useExports = (): [ExportState, ExportActions] => {
  //@ts-ignore
  return useContext<[ExportState, ExportActions]>(ExportsContext);
};

export { ExportsContext, ExportsProvider, useExports };
