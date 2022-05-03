import type { Component } from 'solid-js'

import { createSignal, createEffect, createResource } from "solid-js";

import { on, Show, Switch, Match } from 'solid-js';

import axios from 'axios'

import FileUpload from "./FileUpload"

import { UPLOAD_CONSTANTS } from "../constants"

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
            {UPLOAD_CONSTANTS.FORM_TITLE}
          </h2>
          <p class="mt-2 text-sm text-slate-500">{UPLOAD_CONSTANTS.FORM_DESC}</p>
        </div>
        <Show when={error() != ""}>
          <ErrorTag errorMsg={error()} />
        </Show>

        <form class="mt-8 space-y-3" action="#" method="post">
          <div class="grid grid-cols-1 space-y-2">
            <label class="text-lg font-bold text-slate-600 tracking-wide">{UPLOAD_CONSTANTS.EMAIL_TITLE}</label>
            <span class="text-sm text-slate-500">{UPLOAD_CONSTANTS.EMAIL_DESC}</span>
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
            title={UPLOAD_CONSTANTS.UPLOAD_FORM_TITLE}
            description={UPLOAD_CONSTANTS.UPLOAD_FORM_DESC}
            onFileChange={onFileChange}
            onFileDropped={onFileDropped}
          />}>
            <Match when={uploadedFile()}>
              <FilePreview file={uploadedFile()!} />
            </Match>
            <Match when={!uploadedFile()}>
              <FileUpload
                title={UPLOAD_CONSTANTS.UPLOAD_FORM_TITLE}
                description={UPLOAD_CONSTANTS.UPLOAD_FORM_DESC}
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
                <a href={data().wb_info?.url}>
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
