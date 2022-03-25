import type { Component } from 'solid-js'

import { createSignal, createEffect, createResource } from "solid-js";

import { on, Show, Switch, Match } from 'solid-js';

import axios from 'axios'

const FilePreview = (props: { file: File }) => {
  return (
    <div class="flex-col justify-center sm:max-w-lg w-full p-10 border-secondary-200 border-2 rounded-sm">
      <p class="text-black font-semibold text-center">{props.file.name}</p>
    </div>
  )
}

const UploadButton = (props: { text: string, onClick: () => void, disabled: boolean }) => {
  return (<button type="submit"
    onClick={props.onClick}
    disabled={props.disabled}
    class="
              my-5 
              p-4
              w-full flex justify-center 
              bg-white
              border-4
              border-slate-500
              rounded-sm
              tracking-wide
              text-slate-500 
              font-semibold  
              hover:bg-slate-100 
              hover:text-slate-700
              active:bg-slate-200 
              active:shadow-sm
              shadow-lg 
              cursor-pointer 
              transition 
              ease-in">
    {props.text}
  </button>)
}

const ProgressSpinner = (props: { percent: number }) => {
  return (<div class="
                  transition 
                  ease-in 
                  flex
                  justify-center
                  items-center">
    <div class="w-12 h-12 flex">
      <div class="w-12 h-12 
        rounded-full 
        absolute
        border-4 
        border-solid 
        border-gray-200"></div>

      <div class="w-12 h-12 
        rounded-full 
        animate-spin 
        absolute
        border-4 
        border-solid 
        border-green-500 
        border-t-transparent"></div>
    </div>
    <p class="text-slate-500 font-semibold text-lg w-24 px-3">{`${props.percent}%`}</p>
  </div>
  )
}


const FileUpload = (props: { onFileDropped: (e: Event) => void, onFileChange: (e: Event) => void }) => {
  const [dragging, setDrag] = createSignal(false)
  const isAdvancedUpload = () => {
    var div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
  };

  return (
    <div class="grid grid-cols-1 space-y-2">
      <label class="text-lg font-bold text-slate-600 tracking-wide">Attach WeClock Export</label>
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
            <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-slate-400 group-hover:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div class="flex flex-auto max-h-48 w-2/5 mx-auto -mt-10">
              {/* <img class="has-mask h-36 object-center" src="https://img.freepik.com/free-vector/image-upload-concept-landing-page_52683-27130.jpg?size=338&ext=jpg" alt="freepik image"> */}
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
          <input type="file" class="hidden" onChange={props.onFileChange} />
        </label>
      </div >
    </div >
  )
}


const GoogleLogin: Component = () => {
  const [uploadedFile, setUploadedFile] = createSignal<File>()
  const [email, setEmail] = createSignal("")
  const [error, setError] = createSignal("")
  const [emailAndFile, setEmailAndFile] = createSignal()
  // disappear errors after a few seconds
  createEffect(on(error, () => {
    setTimeout(() => setError(""), 10000), { defer: true }
  }))

  const ErrorTag = ({ errorMsg }: { errorMsg: string }) => (
    <div class="flex flex-col border-2-rose-700 bg-rose-200 rounded-lg p-3 m-2">
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

  const onUploadProgress = (event) => {
    const percentage = Math.round((100 * event.loaded) / event.total);
    setUploadPercent(percentage)
  };

  async function uploadFile(source, { value, refetching }) {
    const file = source.file;
    const email = source.email;
    const formData = new FormData();
    formData.append(
      "file",
      file,
    )
    formData.append(
      'email',
      email
    )
    try {
      const response = await axios.post('http://localhost:5000/exports/upload/', formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        onUploadProgress
      })
      if (response.data.wb_info) {
        console.log("wb info:", response.data.wb_info)
        return response.data
      }
    } catch (error) {
      console.log("error:", error)
      if (error.response) {
        console.log("Had an issue!", error)
      } else if (error.request) {
        console.log("Something wrong with the request")
      }
    }
  }

  const [data, { mutate, refetch }] = createResource(emailAndFile, uploadFile)
  const [uploadPercent, setUploadPercent] = createSignal(0)




  const onFileUpload = () => {
    const file = uploadedFile()
    const formData = new FormData();
    const validEmail = validateEmail(email());

    if (!validEmail) {
      setError("We think that email address is invalid. Please use a valid e-mail!")
      return;
    }
    if (file) {
      setEmailAndFile({ file, email: email() })
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

  const cancelUpload = () => {
    setUploadedFile(undefined)
    mutate({})
  }


  return (
    <div class="flex justify-center">
      <div class="absolute inset-0 z-0"></div>
      <div class="sm:max-w-lg 
        w-full 
        p-10 
        bg-white 
        border-slate-600
        rounded-sm
        border-4 
        z-10">
        <div class="text-center">
          <h2 class="mt-5 text-3xl font-bold text-slate-600">
            WeClock Upload
          </h2>
          <p class="mt-2 text-sm text-slate-500">Upload WeClock Export</p>
        </div>
        <Show when={error() != ""}>
          <ErrorTag errorMsg={error()} />
        </Show>

        <form class="mt-8 space-y-3" action="#" method="post">
          <div class="grid grid-cols-1 space-y-2">
            <label class="text-lg font-bold text-slate-600 tracking-wide">Your Email</label>
            <span class="text-sm text-slate-500">A Google Sheet will be shared with this email address</span>
            <input
              onInput={onEmailChange}
              value={email()}
              type="text"
              class={`
                ${validateEmail(email()) ? "border-emerald-400" : "border-rose-300"}
                ${email() == "" ? "border-slate-400" : ""}
                transition 
                ease-in
                duration-400
                text-base
                p-2
                border-4
                rounded-sm
                focus:outline-none`}
              placeholder="mail@gmail.com" />
          </div>
          <Switch fallback={<FileUpload
            onFileChange={onFileChange}
            onFileDropped={onFileDropped}
          />}>
            <Match when={uploadedFile()}>
              <FilePreview file={uploadedFile()!} />
            </Match>
            <Match when={!uploadedFile()}>
              <FileUpload
                onFileChange={onFileChange}
                onFileDropped={onFileDropped} />
            </Match>
          </Switch>
          <div>
            <Switch>
              <Match when={!data.loading && !data()}>
                <UploadButton onClick={onFileUpload} disabled={!uploadedFile()} text={"Upload"} />
              </Match>
              <Match when={data.loading}>
                <ProgressSpinner percent={uploadPercent()} />
              </Match>
              <Match when={!data.loading && data()}>
                <p class="
                  transition ease-in
                  p-2
                  rounded-sm
                  border-4
                  border-emerald-600
                  bg-emerald-500
                  text-white
                  font-semibold
                  text-center
                  ">
                  Done!
                </p>
                <a href={data().wb_info.url}>
                  <p class="
                  transition ease-in
                  m-2
                  p-2
                  rounded-sm
                  border-4
                  text-slate-500
                  font-semibold
                  text-center
                  border-slate-500
                  ">
                    Go To Google Sheet
                  </p>
                </a>
              </Match>
            </Switch>
            <Show when={uploadedFile() != null && !data()}>
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
                p-4">Cancel</p>
            </Show>

          </div>
        </form >
      </div >
    </div >
  )
}

export default GoogleLogin
