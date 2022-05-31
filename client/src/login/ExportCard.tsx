// import { Component, JSX, createMemo } from "solid-js";
// import { createSignal, createEffect } from "solid-js";


import { HiOutlineXCircle, HiSolidFolder } from "solid-icons/hi";
import * as icons from "solid-icons/hi";
import { createEffect, createSignal, For, on, Show } from "solid-js";
import { unwrap } from "solid-js/store";
import { Button, ValidatedTextField } from "../components";
import { WeClockExport } from "../weclock/export";
import { useExports } from "../weclock/ExportProvider";
import FileUpload from "./FileUpload";

const FilePreview = (props: {
  file: File;
  onPressDelete: (file: File) => void;
}) => {
  const f = unwrap(props.file) as File;
  const abbreviatedFileName =
    f.name.slice(0, 10) + (f.name.length > 10 ? "..." : "");
  return (
    <div class="flex flex-row align-content-start justify-between py-2 w-full">
      <div class="flex flex-row justify-start items-center">
        <HiSolidFolder class="h-10 w-10 px-1" />
        <p class="text-black font-semibold text-left">{abbreviatedFileName}</p>
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          props.onPressDelete(f);
        }}>
        <HiOutlineXCircle class="h-6 w-6 font-bold md:text-gray-400 text-red-400 hover:text-red-400" />
      </button>
    </div >
  );
};



export default (props: {
  isOpen: boolean
  export: WeClockExport
  setError?: (m: string) => void
}) => {
  const [,
    {
      removeExport,
      setFiles,
      setNotes,
      addFilesToExport,
      updateExportId,
    },
  ] = useExports();

  // whether card is open or not
  const [isOpen, setIsOpen] = createSignal<boolean>(props.isOpen)

  // file uploading 
  const [droppedFiles, setDroppedFiles] = createSignal<File[]>([]);

  const onFileChange = (event: Event) => {
    if (event.target != null) {
      const files = Array.from<File>(
        (event.target as HTMLInputElement).files || []
      );
      if (files && files.length > 0) {
        setDroppedFiles(files);
      } else {
        props.setError!("No files selected.");
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
        props.setError!("No files detected, try again...");
      }
    }
  };

  // add files to export when dropped
  createEffect(on(droppedFiles, () => {
    let files = droppedFiles();
    if (files.length > 0) {
      addFilesToExport(props.export.identifier, files);
    }
  })
  );
  // end file uploading

  // update current export identifier
  const updateCurrentExportId = (newId: string) => {
    updateExportId(props.export.identifier, newId);
  };

  // delete a particular file from this export
  const deleteFile = (file: File) => {
    const newFiles = props.export.files.filter((f) => f !== file);
    setFiles(props.export.identifier, newFiles);
  }

  // renders list of files with delete button
  const FileList = (props: { files: File[] }) => {
    return (
      <Show when={props.files.length > 0} fallback={<div></div>}>
        <For each={props.files}>
          {(file) => (
            <FilePreview file={file} onPressDelete={deleteFile} />
          )}
        </For>
      </Show>
    );
  };

  // render if export "closed"
  const ClosedExport = () => (
    <div class="flex flex-row my-2 p-5 rounded-lg shadow-lg border-2 items-center justify-between">
      <p class="font-semibold"> {props.export.identifier}</p>
      <div class="flex flex-row w-1/3 justify-end">
        <div class="flex flex-row items-center">
          <icons.HiSolidFolder class='h-6 w-6 text-gray-500' />
          <p class="text-sm font-semibold"> {props.export.files.length}</p>
        </div>
        <button
          onClick={(e) => { console.log('e', e); e.preventDefault(); console.log("is open?", isOpen()); setIsOpen(true) }}
          class="group px-2">
          <icons.HiSolidPencil
            class="h-6 w-6 font-bold md:text-gray-400 text-red-400 group-hover:text-red-400" />
        </button>
        <button
          onClick={() => removeExport(props.export.identifier)}
          class="group px-2">
          <icons.HiOutlineXCircle
            class="h-6 w-6 font-bold md:text-gray-400 text-red-400 group-hover:text-red-400" />
        </button>
      </div>
    </div>
  )

  // render if export "open"
  const OpenExport = () => {
    return (
      <div class=" my-2 p-5 rounded-lg shadow-lg border-2">
        <FileUpload
          onFileChange={onFileChange}
          onFileDropped={onFileDropped}
        >
          <FileList files={props.export.files} />
        </FileUpload>

        <ValidatedTextField
          class="pt-2"
          text={() => props.export.identifier}
          validator={(s) => s != ""}
          setText={updateCurrentExportId}
          description={"A useful identifier for this participant"}
          title={"Participant ID"}
          inputClass="font-bold"
        />
        <ValidatedTextField
          class="pt-2"
          text={() => props.export.notes}
          validator={(s) => s != ""}
          setText={(s) => setNotes(props.export.identifier, s)}
          description={"Notes for this participant or export"}
          title={"Notes"}
          inputClass="font-bold"
        />
        <Button
          onClick={() => { setIsOpen(false); console.log("closing...") }}
          disabled={false} class="w-full border-none shadow-none -mb-3 mt-2" >
          <icons.HiSolidChevronUp class="h-6 w-6" />
        </Button>
      </div>);
  }

  return (
    <Show when={isOpen()} fallback={(<ClosedExport />)}>
      <OpenExport />
    </Show>
  )


}
