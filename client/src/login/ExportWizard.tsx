import { Component, JSX, createMemo } from "solid-js";

import { createSignal, createEffect } from "solid-js";

import { on, Show, For } from "solid-js";

import { validateEmail } from "../utils";
import FileUpload from "./FileUpload";
import { ValidatedTextField, Button } from "../components";

import { useExports } from "../weclock/ExportProvider";

import { UPLOAD_CONSTANTS } from "../constants";
import { WeClockExport } from "../weclock/export";
import { HiSolidFolder } from "solid-icons/hi";
import { unwrap } from "solid-js/store";
import UploadProgress from "./UploadProgress";
import { useNavigate } from "solid-app-router";

const FilePreview = (props: {
  file: File;
  onPressDelete: (file: File) => void;
}) => {
  const f = unwrap(props.file) as File;
  const abbreviatedFileName =
    f.name.slice(0, 20) + (f.name.length > 20 ? "..." : "");
  return (
    <div class="flex flex-row align-content-start justify-between py-2 w-full">
      <div class="flex flex-row justify-start items-center">
        <HiSolidFolder class="h-10 w-10 px-1" />
        <p class="text-black font-semibold text-left">{abbreviatedFileName}</p>
      </div>
      <div>
        <button
          onClick={(e) => {
            e.preventDefault();
            props.onPressDelete(f);
          }}
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
  const navigate = useNavigate();

  createEffect(
    on(error, () => {
      console.log("error set:", error());
      setTimeout(() => setError(""), 10000), { defer: true };
    })
  );

  const [
    exportState,
    {
      getCurrentExport,
      setCurrentExportIndex,
      setCurrentFiles,
      setCurrentNotes,
      setUserEmail,
      addFilesToExport,
      addExport,
      updateExportId,
      clearExports,
    },
  ] = useExports();

  const updateCurrentExportId = (newId: string) => {
    updateExportId(exportState.currentExportIndex, newId);
  };

  const currentExport = createMemo(() => {
    return exportState.exports[exportState.currentExportIndex];
  });

  const currentId = createMemo(() => {
    return exportState.exports[exportState.currentExportIndex].identifier;
  });

  const currentFiles = createMemo<File[]>(() => {
    let exp = getCurrentExport();
    return exp ? exp.files : [];
  });

  // update store email if it's valid
  createEffect(on(email, (e) => (validateEmail(e) ? setUserEmail(e) : null)));

  const onNextParticipant = () => {
    const exports = exportState.exports as WeClockExport[];
    const currentExport = getCurrentExport();
    if (currentExport.files.length === 0) return;

    const currentIdx = exportState.currentExportIndex;
    let nextIdx = currentIdx + 1;
    if (nextIdx >= exports.length) {
      addExport();
      setCurrentExportIndex(nextIdx);
    } else {
      setCurrentExportIndex(nextIdx);
    }
  };

  const onPreviousParticipant = () => {
    const currentIdx = unwrap(exportState).currentExportIndex;
    let nextIdx = currentIdx - 1;
    if (nextIdx < 0) {
      return;
    } else {
      setCurrentExportIndex(nextIdx);
    }
  };

  // update current export's uploaded files when new files are added
  createEffect(
    on(droppedFiles, (prev) => {
      let files = droppedFiles();
      if (files.length > 0) {
        addFilesToExport(exportState.currentExportIndex, files);
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
    clearExports();
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
            title={UPLOAD_CONSTANTS.EMAIL_TITLE}
            description={UPLOAD_CONSTANTS.EMAIL_DESC}
            placeholder={"solidarity@weclock.it"}
          />
          <div class="flex flex-col space-y-2">
            <label class="text-xl font-bold text-slate-600 tracking-wide">
              {UPLOAD_CONSTANTS.UPLOAD_FORM_TITLE}
            </label>
            <span class="text-sm text-slate-500">
              {UPLOAD_CONSTANTS.UPLOAD_FORM_DESC}
            </span>
            <br />
          </div>

          <div>
            <FileUpload
              onFileChange={onFileChange}
              onFileDropped={onFileDropped}
            >
              <FileList files={getCurrentExport().files} />
            </FileUpload>

            <ValidatedTextField
              class="pt-2"
              text={() => currentExport().identifier}
              validator={(s) => s != ""}
              setText={updateCurrentExportId}
              description={"A useful identifier for this participant"}
              title={"Participant ID"}
              inputClass="font-bold"
            />
            <ValidatedTextField
              class="pt-2"
              text={() => currentExport().notes}
              validator={(s) => s != ""}
              setText={(s) => setCurrentNotes(s)}
              description={"Notes for this participant or export"}
              title={"Notes"}
              inputClass="font-bold"
            />

            {/* <h1 class="text-xl font-bold">{getCurrentExport().identifier}</h1> */}
            <div class="flex flex-row flex-wrap justify-between">
              <Button
                class="w-full sm:w-auto"
                onClick={onPreviousParticipant}
                text={"Previous Participant"}
                disabled={false}
              />

              <Button
                class="w-full sm:w-auto"
                disabled={getCurrentExport() == null}
                onClick={onNextParticipant}
                text={"Next Participant"}
              />
            </div>

            <UploadProgress
              exports={exportState.exports as WeClockExport[]}
              email={email()}
              setError={setError}
              onUploaded={() => navigate("/label")}
            />
            <Show when={exportState.exports.length >= 1}>
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
                Clear All
              </p>
            </Show>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExportWizard;
