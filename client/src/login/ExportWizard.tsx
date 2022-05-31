import { Component, Accessor } from "solid-js";

import { createSignal, createEffect, indexArray } from "solid-js";

import { on, Show, For } from "solid-js";

import { validateEmail } from "../utils";
import { Button } from "../components";

import { useExports } from "../weclock/ExportProvider";

import { UPLOAD_CONSTANTS } from "../constants";
import { WeClockExport } from "../weclock/export";
import UploadProgress from "./UploadProgress";
import { useNavigate } from "solid-app-router";


import ExportCard from "./ExportCard";

const ExportWizard: Component = (props) => {

  const [
    exportState,
    {
      setUserEmail,
      addExport,
      clearExports,
    },
  ] = useExports();

  const [error, setError] = createSignal("");
  const [email, setEmail] = createSignal("");
  const navigate = useNavigate();

  createEffect(
    on(error, () => {
      console.log("error set:", error());
      setTimeout(() => setError(""), 10000), { defer: true };
    })
  );

  // update store email if it's valid
  createEffect(on(email, (e) => (validateEmail(e) ? setUserEmail(e) : null)));

  // update current export's uploaded files when new files are added
  const cancelUpload = () => {
    clearExports();
  };

  const ErrorTag = ({ errorMsg }: { errorMsg: string }) => (
    <div class="flex flex-col border-2-rose-700 bg-rose-200 rounded-lg p-3 m-2">
      <p>{errorMsg}</p>
    </div>
  );

  return (
    <div class="flex-col content-center justify-center w-full h-full">
      <div
        class="sm:max-w-lg 
				w-full 
				p-10 
				bg-white 
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
          {/* <ValidatedTextField */}
          {/*   text={email} */}
          {/*   setText={setEmail} */}
          {/*   validator={validateEmail} */}
          {/*   title={UPLOAD_CONSTANTS.EMAIL_TITLE} */}
          {/*   description={UPLOAD_CONSTANTS.EMAIL_DESC} */}
          {/*   placeholder={"solidarity@weclock.it"} */}
          {/* /> */}
          <div class="flex flex-col space-y-2">
            <label class="text-xl font-bold text-slate-600 tracking-wide">
              {UPLOAD_CONSTANTS.UPLOAD_FORM_TITLE}
            </label>
            <span class="text-sm text-slate-500">
              {UPLOAD_CONSTANTS.UPLOAD_FORM_DESC}
            </span>
            <br />
          </div>

          <div class="w-full">
            {indexArray(
              () => exportState.exports as WeClockExport[],
              (e: Accessor<WeClockExport>, i: number) => (
                <ExportCard
                  isOpen={i == 0}
                  export={e()}
                  setError={(s: string) => setError(s)} />)
            )}

          </div>

          <div class="grid grid-cols-1 gap-5 ">
            <Button
              class="col-span-1 sm:w-auto border border-gray-100 py-5"
              onClick={addExport}
            >
              New Participant
            </Button>
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
        </form>
      </div>
      <div class="h-16" />
    </div >
  );
};

export default ExportWizard;
