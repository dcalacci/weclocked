import { createContext, useContext } from "solid-js";
import type { Component } from "solid-js";
import { Store } from "solid-js/store";
import { createLocalStore } from "../store";

import { Stops, Locs, WeClockExport } from "./export";
import { STORAGE_CONSTANTS } from "../constants";

export type ExportState = Store<{
  exports: WeClockExport[];
  currentExportIndex: number;
  email: string;
  stops: Stops[];
  locs: Locs[];
}>;

export type ExportActions = {
  getCurrentExport: () => WeClockExport;
  getExportById: (identifier: string) => WeClockExport | undefined;
  addExport: () => void;
  addFilesToExport: (idx: number, files: File[]) => void;
  setExportFiles: (idx: number, files: File[]) => void;
  setUserEmail: (email: string) => void;
  setCurrentExportIndex: (idx: number) => void;
  setCurrentFiles: (files: File[]) => void;
  setCurrentNotes: (notes: string) => void;
  updateExportId: (idx: number, newId: string) => void;
  clearExports: () => void;
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
      locs: []
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
      getCurrentExport: () => {
        let exps = state.exports as WeClockExport[];
        return exps[state.currentExportIndex];
      },
      getExportById: (identifier) => {
        let exps = state.exports as WeClockExport[];
        let exp = exps.find((exportObj) => exportObj.identifier === identifier);
        return exp;
      },
      addFilesToExport: (idx, files) => {
        setState(
          "exports",
          idx,
          (exp) => new WeClockExport([...exp.files, ...files], exp.identifier)
        );
      },
      addExport: () => {
        setState(
          "exports",
          state.exports.length,
          new WeClockExport([], `Participant ${state.exports.length + 1}`, "")
        );
      },
      setExportFiles: (idx: number, files: File[]) => {
        setState(
          "exports",
          idx,
          (exp) => new WeClockExport([...files], exp.identifier, exp.notes)
        );
      },
      setCurrentExportIndex: (idx: number) => {
        setState("currentExportIndex", idx);
      },
      setUserEmail: (email: string) => {
        setState("email", email);
      },
      setCurrentFiles: (files: File[]) => {
        setState(
          "exports",
          state.currentExportIndex,
          (exp) => new WeClockExport([...files], exp.identifier, exp.notes)
        );
      },
      setCurrentNotes: (notes: string) => {
        setState(
          "exports",
          state.currentExportIndex,
          (exp) => new WeClockExport([...exp.files], exp.identifier, notes)
        );
      },

      updateExportId: (idx: number, newId: string) => {
        setState(
          "exports",
          idx,
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
