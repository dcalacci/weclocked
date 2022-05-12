import {
  createUniqueId,
  createContext,
  useContext,
  createEffect,
  createSignal,
  on,
} from "solid-js";
import type { Component, Context } from "solid-js";
import { createStore, produce, unwrap } from "solid-js/store";
import type { Store, SetStoreFunction } from "solid-js/store";

import { getStorage } from "@sifrr/storage";

import { WeClockExport } from "./export";
import { STORAGE_CONSTANTS } from "../constants";

const storage = getStorage("indexeddb");

interface ExportState {
  dataExport: WeClockExport;
}

interface ExportActions {
  setExportFiles: (files: File[]) => void;
  setIdentifier: (identifier: string) => void;
}

interface ExportStorage {
  weClockExport: ExportState;
}

//TODO: trying to make the overall state persist in local storage here.
// the game is to convert our file objects to blobs that we can:
// (a) upload
// (b) parse so we can send limited data to our server
// (c) save locally so people don't lose their place when they leave
// storageKey is the key used inside of SifrrStorage. Think of it as a scope for data objects.
function createLocalStore<T>(
  initState: T,
  storageKey: string = "defaultKey"
): [Store<T>, SetStoreFunction<T>] {
  const [state, setStore] = createStore<T>(initState);
  const [triggerUpdate, setTriggerUpdating] = createSignal<number>(1);

  storage.get(storageKey).then((v) => {
    if (v) {
      //@ts-ignore
      let val = v[storageKey];
      setState(val);
    } else {
      console.log("no saved exports.");
    }
  });


  //@ts-ignore
  const setState: typeof setStore = (...args) => {
    setTriggerUpdating((v) => v + 1);
    //@ts-ignore
    setStore(...args);
  };

  createEffect(on(triggerUpdate, () => storage.set(storageKey, unwrap(state))));

  return [state, setState];
}

const ExportsContext = createContext<[ExportState, ExportActions]>();

// This provider allows you to wrap components in <ExportsProvider> and get access to the global store below
const ExportsProvider: Component = (props) => {
  const [state, setState] = createLocalStore<ExportState>({
    dataExport: new WeClockExport(),
  },
  STORAGE_CONSTANTS.EXPORTS_STORAGE_KEY);

  const store: [ExportState, ExportActions] = [
    //@ts-ignore this issue. it complains about File[] being mutable. The alternative is FileList,
    // but that makes no sense. Should be fine.
    state,
    {
      // sets the export files using the files arg
      setExportFiles: (files: File[]) => {
        const dataExport: WeClockExport = new WeClockExport(files);
        console.log("Setting data export in store to:", dataExport);
        setState("dataExport", dataExport);
      },
      setIdentifier: (identifier: string) =>
        // uses produce for mutation (mutates the object in state)
        produce((s: ExportState) => {
          s.dataExport.identifier = identifier;
        }),
    },
  ];

  return (
    <ExportsContext.Provider value={store}>
      {props.children}
    </ExportsContext.Provider>
  );
};
export function useExports(): [ExportState, ExportActions] {
  //@ts-ignore
  return useContext<[ExportState, ExportActions]>(ExportsContext);
}


export {
  ExportsContext,
  ExportsProvider,
}