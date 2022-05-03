import type { Component } from 'solid-js'

import { createSignal, createEffect, createResource } from "solid-js";

import { on, Show, Switch, Match } from 'solid-js';



const FileUpload = (props: {
  onFileDropped: (e: Event) => void,
  onFileChange: (e: Event) => void,
  title: string,
  description: string,
  children?: Element
}) => {

  const [dragging, setDrag] = createSignal(false)
  const isAdvancedUpload = () => {
    var div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
  };

  return (
    <div class="grid grid-cols-1 space-y-2">
      <label class="text-lg font-bold text-slate-600 tracking-wide">{props.title}</label>
      <span class="text-sm text-slate-500">Upload the .zip file from your WeClock export here. Your data will be securely shared with the WeClock team and processed into a Google Sheet visible only to you and WeClock.</span>
      <div
        draggable
        onDrop={(e) => { e.preventDefault(); e.preventDefault(); setDrag(false); props.onFileDropped(e); }}
        onDragEnter={() => setDrag(true)}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={(e) => { e.preventDefault(); setDrag(false) }}

        class="flex items-center justify-center w-full cursor-pointer">
        <label
          class={`${dragging() ? 'bg-gray-200' : 'bg-white'} 
              transition 
              ease-in 
              flex 
              flex-col 
              rounded-sm
              border-4 
              border-dashed 
              border-slate-300
              w-full 
              h-60 
              p-10 
              group 
              text-center 
              hover:bg-slate-100
              hover:border-slate-700
              cursor-pointer`}>
          <div class="h-full 
              w-full 
              text-center 
              flex 
              flex-col 
              items-center 
              justify-center">
            <div class="p-10">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-slate-400 group-hover:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div class="flex flex-auto max-h-48 w-2/5 mx-auto -mt-10">
            </div>
            <Show when={isAdvancedUpload()}>
              <p class="text-slate-500 ">Drag and drop export here<br /> </p>
              <p class="text-slate-500">or</p>
            </Show>
            <p class="transition 
              ease-in 
              shadow-md
              border-slate-400
              border-2
              cursor-pointer 
              font-semibold
              rounded-sm
              hover:shadow-sm
              hover:bg-slate-200 
              hover:text-slate-700
              active:bg-slate-300 
              active:shadow-sm
              p-1
              px-3 
              m-2 ">Tap here to select a file</p>
          </div>
          <input type="file" multiple class="hidden" onChange={props.onFileChange} />
        </label>
      </div >
    </div >
  )
}


export default FileUpload
