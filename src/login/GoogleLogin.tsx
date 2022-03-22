import type { Component } from 'solid-js'

import { createSignal, createEffect } from "solid-js";

import { on, Show, Switch, Match } from 'solid-js';

const GoogleLogin: Component = () => {
  const [uploadedFile, setUploadedFile] = createSignal<File>()
  const [email, setEmail] = createSignal("")
  const [error, setError] = createSignal("")

  // disappear errors after a few seconds
  createEffect(on(error, () => {
    setTimeout(() => setError(""), 10000), { defer: true }
  }))

  const isAdvancedUpload = () => {
    var div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
  };

  const ErrorTag = ({ errorMsg }: { errorMsg: string }) => (
    <div class="flex flex-col border-2-red-900 bg-red-400 rounded-lg p-3">
      <p>{errorMsg}</p>
    </div>
  )

  const validateEmail = (email: string): boolean => {
    var re = /\S+@\S+\.\S+/;
    console.log("testing email")
    return re.test(email);
  }

  const onEmailChange = (event: Event) => {
    if (event.target != null) {
      const email = (event.target as HTMLInputElement).value
      console.log("setting email to:", email)
      setEmail(email)
    }
  }

  const onFileUpload = (e: Event) => {
    e.preventDefault()
    const file = uploadedFile()
    const formData = new FormData();
    const validEmail = validateEmail(email());

    if (!validEmail) {
      setError("We think that email address is invalid. Please use a valid e-mail!")
      return;
    }
    if (file) {
      formData.append(
        "WeClock Upload",
        file as Blob,
        file.name
      )
    } else {
      setError("File not uploaded. Try again?")
    }
  }

  const onFileChange = (event: Event) => {
    if (event.target != null) {
      const files = (event.target as HTMLInputElement).files
      if (files && files.length > 0) {
        setUploadedFile(files[0])
      } else {
        setError("No files selected.")
      }
    }
  }

  const onFileDropped = (event: Event) => {
    const e = event as DragEvent;
    e.preventDefault()
    e.stopPropagation();
    if (e.dataTransfer) {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        setUploadedFile(files[0])
      } else {
        setError("No files detected, try again...")
      }
    }
  }

  const FilePreview = ({ file }: { file: File }) => {
    return (
      <div class="flex justify-center sm:max-w-lg w-full p-10 border-secondary-200 border-2 rounded-xl">
        <p class="text-black font-semibold">{file.name}</p>
      </div>
    )
  }


  const FileUpload = () => {

    const [dragging, setDrag] = createSignal(false)
    return (
      <div class="grid grid-cols-1 space-y-2">
        <label class="text-lg font-bold text-gray-600 tracking-wide">Attach WeClock Export</label>
        <span class="text-sm text-gray-500">Upload the .zip file from your WeClock export here. Your data will be securely shared with the WeClock team and processed into a Google Sheet visible only to you and WeClock.</span>
        <div
          draggable
          onDrop={(e) => { e.preventDefault(); e.preventDefault(); setDrag(false); onFileDropped(e); }}
          onDragEnter={() => setDrag(true)}
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={(e) => { e.preventDefault(); setDrag(false) }}

          class="flex items-center justify-center w-full cursor-pointer">
          <label
            class={`${dragging() ? 'bg-gray-200' : 'bg-white'} transition ease-in flex flex-col rounded-lg border-4 border-dashed w-full h-60 p-10 group text-center cursor-pointer`}>
            <div class="h-full w-full text-center flex flex-col items-center justify-center items-center  ">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-blue-400 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div class="flex flex-auto max-h-48 w-2/5 mx-auto -mt-10">
                {/* <img class="has-mask h-36 object-center" src="https://img.freepik.com/free-vector/image-upload-concept-landing-page_52683-27130.jpg?size=338&ext=jpg" alt="freepik image"> */}
              </div>
              <Show when={isAdvancedUpload()}>
                <p class="text-gray-500 ">Drag and drop export here<br /> </p>
                <p class="text-gray-500">or</p>
              </Show>
              <p class=" transition ease-in text-white font-semibold active:bg-blue-700 hover:bg-blue-600 hover:shadow-sm bg-blue-500 rounded-xl p-1 px-3 m-2 ">Tap here to select a file</p>
            </div>
            <input type="file" class="hidden" onChange={onFileChange} />
          </label>
        </div>
      </div>
    )
  }

  return (
    <div class="flex justify-center">
      <div class="absolute inset-0 z-0"></div>
      <div class="sm:max-w-lg w-full p-10 bg-white border-secondary-400 border-4 rounded-xl z-10">
        <div class="text-center">
          <h2 class="mt-5 text-3xl font-bold text-gray-900">
            WeClock Upload
          </h2>
          <p class="mt-2 text-sm text-gray-400">Upload WeClock Export</p>
        </div>
        <Show when={error() != ""}>
          <ErrorTag errorMsg={error()} />
        </Show>

        <form class="mt-8 space-y-3" action="#" method="post">
          <div class="grid grid-cols-1 space-y-2">
            <label class="text-lg font-bold text-gray-600 tracking-wide">Your Email</label>
            <span class="text-sm text-gray-500">A Google Sheet will be shared with this email address</span>
            <input
              onInput={onEmailChange}
              value={email()}
              type="text"
              class={(validateEmail(email()) ? "border-emerald-400" : "border-rose-300") + " transition ease-in duration-400 text-base p-2 border-2 rounded-lg focus:outline-none"} placeholder="mail@gmail.com" />
          </div>
          <Switch fallback={<FileUpload />}>
            <Match when={uploadedFile()}>
              <FilePreview file={uploadedFile()!} />
            </Match>
            <Match when={!uploadedFile()}>
              <FileUpload />
            </Match>
          </Switch>
          <div>
            <button type="submit"
              onClick={onFileUpload}
              class="my-5 w-full flex justify-center bg-blue-500 text-gray-100 p-4  rounded-full tracking-wide
                                    font-semibold  focus:outline-none focus:shadow-outline hover:bg-blue-600 
              shadow-lg cursor-pointer transition ease-in duration-300">
              Upload
            </button>
          </div>
        </form >
      </div >
    </div >
  )
}

export default GoogleLogin
