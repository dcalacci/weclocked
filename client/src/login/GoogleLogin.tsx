import type { Component } from "solid-js";

import {
  createSignal,
  createEffect,
  createResource,
  useContext,
} from "solid-js";

import { on, Show, Switch, Match, For } from "solid-js";

import axios, { AxiosResponse, AxiosError } from "axios";

import FileUpload from "./FileUpload";

import { ExportsContext, useExports } from "../weclock/ExportProvider";

import { UPLOAD_CONSTANTS } from "../constants";

const FilePreview = (props: { file: File }) => {
  return (
    <div class="flex-col justify-center sm:max-w-lg w-full p-10 border-secondary-200 border-2 rounded-sm">
      <p class="text-black font-semibold text-center">{props.file.name}</p>
    </div>
  );
};

const UploadButton = (props: {
  text: string;
  onClick: () => void;
  disabled: boolean;
}) => {
  return (
    <button
      type="submit"
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
							ease-in"
    >
      {props.text}
    </button>
  );
};

const ProgressSpinner = (props: { percent: number }) => {
  return (
    <div
      class="
									transition 
									ease-in 
									flex
									justify-center
									items-center"
    >
      <div class="w-12 h-12 flex">
        <div
          class="w-12 h-12 
				rounded-full 
				absolute
				border-4 
				border-solid 
				border-gray-200"
        ></div>

        <div
          class="w-12 h-12 
				rounded-full 
				animate-spin 
				absolute
				border-4 
				border-solid 
				border-green-500 
				border-t-transparent"
        ></div>
      </div>
      <p class="text-slate-500 font-semibold text-lg w-24 px-3">{`${props.percent}%`}</p>
    </div>
  );
};

const GoogleLogin: Component = (props) => {
  const [email, setEmail] = createSignal<string>("");
  const [error, setError] = createSignal<string>("");
  const [emailAndFiles, setEmailAndFiles] = createSignal<{
    files: File[];
    email: string;
  }>({ files: [], email: "" });

  const [uploadedFiles, setUploadedFiles] = createSignal<File[]>([]);
  const [uploadPercent, setUploadPercent] = createSignal(0);

  const [exports, { setExportFiles }] = useExports();

  // disappear errors after a few seconds
  createEffect(
    on(error, () => {
      setTimeout(() => setError(""), 10000), { defer: true };
    })
  );

  createEffect(
    on(uploadedFiles, () => {
      let files = uploadedFiles();
      // do not overwrite files if we have an empty array.
      if (files.length > 0) {
        setExportFiles(files);
      }
    })
  );

  const validateEmail = (email: string): boolean => {
    var re = /\S+@\S+\.\S+/;
    console.log("testing email");
    return re.test(email);
  };

  const onEmailChange = (event: Event) => {
    if (event.target != null) {
      const email = (event.target as HTMLInputElement).value;
      console.log("setting email to:", email);
      setEmail(email);
    }
  };

  const onUploadProgress = (event: ProgressEvent) => {
    const percentage = Math.round((100 * event.loaded) / event.total);
    setUploadPercent(percentage);
  };

  interface UploadData {
    wb_info: { url: string };
    upload: string;
  }
  // type UploadResponse = AxiosResponse<UploadData>;

  async function uploadFile(source: {
    files: File[];
    email: string;
  }): Promise<UploadData | undefined> {
		if (source.files.length == 0) return undefined
    const files = source.files;
    const email = source.email;
    const formData = new FormData();
    Array.from(files).forEach((f: File) => {
      formData.append("file", f);
    });
    formData.append("email", email);
    try {
      const response = await axios.post(
        "http://localhost:5000/exports/upload/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress,
        }
      );
      if (response.data.wb_info) {
        console.log("wb info:", response.data.wb_info);
        return response.data;
      }
    } catch (err) {
      const errors = err as Error | AxiosError;
      if (axios.isAxiosError(errors)) {
        console.log("Something wrong with the request");
      } else {
        console.log("Some other error, oops");
      }
    }
    return undefined;
  }

  const [data, { mutate, refetch }] = createResource<
    UploadData | undefined,
    { files: File[]; email: string }
  >(emailAndFiles, uploadFile);

  const onFileUpload = () => {
    //    event.preventDefault()
    const files = uploadedFiles();
    const formData = new FormData();
    const validEmail = validateEmail(email());

    if (!validEmail) {
      setError(
        "We think that email address is invalid. Please use a valid e-mail!"
      );
      return;
    }
    if (files) {
      setEmailAndFiles({ files, email: email() });
    } else {
      setError("File not uploaded. Try again?");
    }
  };

  const onFileChange = (event: Event) => {
    if (event.target != null) {
      const files = Array.from<File>(
        (event.target as HTMLInputElement).files || []
      );
      if (files && files.length > 0) {
        setUploadedFiles(files);
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
        setUploadedFiles(files);
      } else {
        setError("No files detected, try again...");
      }
    }
  };

  const cancelUpload = () => {
    setUploadedFiles([]);
    //@ts-ignore
    mutate({ files: [], email: email() });
  };

  const ErrorTag = ({ errorMsg }: { errorMsg: string }) => (
    <div class="flex flex-col border-2-rose-700 bg-rose-200 rounded-lg p-3 m-2">
      <p>{errorMsg}</p>
    </div>
  );

  return (
    <div class="flex justify-center">
      {/* <div class="absolute inset-0 z-100"></div> */}
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
          <div class="grid grid-cols-1 space-y-2">
            <label class="text-lg font-bold text-slate-600 tracking-wide">
              {UPLOAD_CONSTANTS.EMAIL_TITLE}
            </label>
            <span class="text-sm text-slate-500">
              {UPLOAD_CONSTANTS.EMAIL_DESC}
            </span>
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
              placeholder="mail@gmail.com"
            />
          </div>
          <Switch
            fallback={
              <FileUpload
                title={UPLOAD_CONSTANTS.UPLOAD_FORM_TITLE}
                description={UPLOAD_CONSTANTS.UPLOAD_FORM_DESC}
                onFileChange={onFileChange}
                onFileDropped={onFileDropped}
              />
            }
          >
            <Match when={uploadedFiles().length > 0}>
              <For each={Array.from<File>(uploadedFiles())}>
                {(file) => <FilePreview file={file} />}
              </For>
            </Match>
            <Match when={uploadedFiles().length == 0}>
              <FileUpload
                title={UPLOAD_CONSTANTS.UPLOAD_FORM_TITLE}
                description={UPLOAD_CONSTANTS.UPLOAD_FORM_DESC}
                onFileChange={onFileChange}
                onFileDropped={onFileDropped}
              />
            </Match>
          </Switch>
          <div>
            <Switch>
              <Match when={!data.loading && !data()}>
                <UploadButton
                  onClick={onFileUpload}
                  disabled={uploadedFiles().length == 0}
                  text={"Upload"}
                />
              </Match>
              <Match when={data.loading}>
                <ProgressSpinner percent={uploadPercent()} />
              </Match>
              <Match when={!data.loading && data()}>
                <p
                  class="
									transition ease-in
									p-2
									rounded-sm
									border-4
									border-emerald-600
									bg-emerald-500
									text-white
									font-semibold
									text-center
									"
                >
                  Done!
                </p>
                <a href={data()!.wb_info?.url}>
                  <p
                    class="
									transition ease-in
									m-2
									p-2
									rounded-sm
									border-4
									text-slate-500
									font-semibold
									text-center
									border-slate-500
									"
                  >
                    Go To Google Sheet
                  </p>
                </a>
                <a href={"/label"}>
                  <p
                    class="
									transition ease-in
									m-2
									p-2
									rounded-sm
									border-4
									text-slate-500
									font-semibold
									text-center
									border-slate-500
									"
                  >
                    Next
                  </p>
                </a>
              </Match>
            </Switch>
            <Show when={uploadedFiles().length > 0 && !data()}>
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

export default GoogleLogin;
