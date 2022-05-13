import { createContext, useContext } from "solid-js";
import type { Component } from "solid-js";
import { produce } from "solid-js/store";
import { createLocalStore } from "../store";

import { getStorage } from "@sifrr/storage";

import { WeClockExport } from "./export";
import { STORAGE_CONSTANTS } from "../constants";

interface ExportState {
  exports: WeClockExport[];
  currentExportId: string | null;
  email: string;
}

interface ExportActions {
  getExport: (identifier: string) => WeClockExport | undefined;
  addExport: (exportObj: WeClockExport) => void;
  addFilesToExport: (identifier: string, files: File[]) => void;
  setUserEmail: (email: string) => void;
  setCurrentExportId: (identifier: string | null) => void;
}

const ExportsContext = createContext<[ExportState, ExportActions]>();

// This provider allows you to wrap components in <ExportsProvider> and get access to the global store below
const ExportsProvider: Component = (props) => {
  const [state, setState] = createLocalStore<ExportState>(
    {
      exports: [] as WeClockExport[],
      currentExportId: "",
      email: "",
    },
    STORAGE_CONSTANTS.EXPORTS_STORAGE_KEY
  );

  const store: [ExportState, ExportActions] = [
    //@ts-ignore this issue. it complains about File[] being mutable. The alternative is FileList,
    // but that makes no sense. Should be fine.
    state,
    {
      setCurrentExportId: (identifier: string | null) => {
        setState("currentExportId", identifier);
      },
      getExport: (identifier) => {
        let exps = state.exports as WeClockExport[];
        let exp = exps.find((exportObj) => exportObj.identifier === identifier);
        return exp;
      },
      addFilesToExport: (identifier, files) => {
        setState(
          "exports",
          (exp) => exp.identifier === identifier,
          produce((exp) => {
            exp.files = [...exp.files, ...files];
          })
        );
      },
      setUserEmail: (email: string) => {
        setState("email", email);
      },
      addExport: (exportObj: WeClockExport) => {
        setState(
          produce((s) => {
            s.exports.push(exportObj);
          })
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
