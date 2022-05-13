import { Component, JSX, createMemo } from "solid-js";

import { createSignal, createEffect, createResource } from "solid-js";

import { on, Show, Switch, Match, For } from "solid-js";

import axios, { AxiosError } from "axios";

import { validateEmail } from "../utils";
import FileUpload from "./FileUpload";
import { ValidatedTextField, ProgressSpinner, Button } from "../components";

import { useExports } from "../weclock/ExportProvider";

import { UPLOAD_CONSTANTS } from "../constants";
import { WeClockExport } from "../weclock/export";
import { HiSolidXCircle, HiSolidFolder } from "solid-icons/hi";

const FilePreview = (props: {
  file: File;
  onPressDelete: (file: File) => void;
}) => {
  const abbreviatedFileName = props.file.name.slice(0, 20) + "...";
  return (
    <div class="flex flex-row align-content-start justify-between px-5 py-2 w-full">
      <div class="flex flex-row justify-start items-center">
        <HiSolidFolder class="h-10 w-10 px-1" />
        <p class="text-black font-semibold text-left">{abbreviatedFileName}</p>
      </div>
      <div>
        <button
          onClick={() => props.onPressDelete(props.file)}
          class=" py-1 border-red-600 hover:bg-red-400 border-2 font-bold w-20"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

const ExportWizard: Component = (props) => {
  const [error, setError] = createSignal("");
  const [email, setEmail] = createSignal("");

  const [droppedFiles, setDroppedFiles] = createSignal<File[]>([]);

  const [
    exportState,
    {
      getCurrentExport,
      getExport,
      setCurrentExportId,
      setCurrentFiles,
      setUserEmail,
      setExportFiles,
      addFilesToExport,
      addExport,
    },
  ] = useExports();

  const currentFiles = createMemo<File[]>(() => {
    let exp = getCurrentExport();
    return exp ? exp.files : [];
  });

  // update store email if it's valid
  createEffect(on(email, (e) => (validateEmail(e) ? setUserEmail(e) : null)));

  const addNewParticipant = (files?: File[]) => {
    const exportObj = new WeClockExport(files || []);
    addExport(exportObj);
    setCurrentExportId(exportObj.identifier);
    console.log(
      "[addNewParticipant]: added new export/participant:",
      exportObj
    );
    console.log(
      "[addNewParticipant]: set new export id:",
      exportObj.identifier
    );
  };

  // update current export's uploaded files when new files are added
  createEffect(
    on(droppedFiles, (prev) => {
      let files = droppedFiles();
      if (files.length > 0) {
        let exps = exportState.exports as WeClockExport[];
        if (exps.length === 0) {
          addNewParticipant(droppedFiles());
        } else if (exportState.currentExportId !== null) {
          addFilesToExport(exportState.currentExportId, files);
        }
      }
    })
  );

  const onFileChange = (event: Event) => {
    if (event.target != null) {
      const files = Array.from<File>(
        (event.target as HTMLInputElement).files || []
      );
      if (files && files.length > 0) {
        setDroppedFiles(files);
      } else {
        setError("No files selected.");
      }
    }
  };

  const onFileDropped = (event: Event) => {
    const e = event as DragEvent;
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      const files = Array.from<File>(e.dataTransfer.files);
      if (files && files.length > 0) {
        setDroppedFiles(files);
      } else {
        setError("No files detected, try again...");
      }
    }
  };

  const cancelUpload = () => {
    setDroppedFiles([]);
    setCurrentFiles([]);
    //@ts-ignore
    mutate(undefined);
  };

  const ErrorTag = ({ errorMsg }: { errorMsg: string }) => (
    <div class="flex flex-col border-2-rose-700 bg-rose-200 rounded-lg p-3 m-2">
      <p>{errorMsg}</p>
    </div>
  );

  const FileList: Component<{ files: File[] }> = (props): JSX.Element => {
    const deleteFile = (file: File) => {
      const newFiles = currentFiles().filter((f) => f !== file);
      setCurrentFiles(newFiles);
    };
    return (
      <Show when={props.files.length > 0} fallback={<div></div>}>
        <For each={props.files}>
          {(file, index) => (
            <FilePreview file={file} onPressDelete={deleteFile} />
          )}
        </For>
      </Show>
    );
  };

  return (
    <div class="flex justify-center">
      <div
        class="sm:max-w-lg 
				w-full 
				p-10 
				bg-white 
				border-slate-600
				rounded-sm
				border-4 
				z-10"
      >
        <div class="text-center">
          <h2 class="mt-5 text-3xl font-bold text-slate-600">
            {UPLOAD_CONSTANTS.FORM_TITLE}
          </h2>
          <p class="mt-2 text-sm text-slate-500">
            {UPLOAD_CONSTANTS.FORM_DESC}
          </p>
        </div>
        <Show when={error() != ""}>
          <ErrorTag errorMsg={error()} />
        </Show>

        <form class="mt-8 space-y-3" action="#" method="post">
          <ValidatedTextField
            text={email}
            setText={setEmail}
            validator={validateEmail}
            placeholder={"solidarity@weclock.it"}
          />
          <FileUpload
            class="border-top border-black"
            title={UPLOAD_CONSTANTS.UPLOAD_FORM_TITLE}
            description={UPLOAD_CONSTANTS.UPLOAD_FORM_DESC}
            onFileChange={onFileChange}
            onFileDropped={onFileDropped}
          >
            <FileList files={currentFiles()} />
          </FileUpload>
          <div>
            <Button
              onClick={addNewParticipant}
              disabled={false}
              text={"Add New Participant"}
            />
          </div>
          <div>
            <Show when={currentFiles().length > 0}>
              <p
                onClick={cancelUpload}
                class="transition 
							text-center
							ease-in 
							shadow-md
							border-rose-400
							border-2
							cursor-pointer 
							font-semibold
							rounded-sm
							hover:shadow-md
							hover:bg-rose-200 
							hover:text-slate-700
							active:bg-rose-300 
							active:shadow-sm
								my-5
								p-4"
              >
                Cancel
              </p>
            </Show>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExportWizard;
