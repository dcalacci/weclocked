import { Component, Accessor } from "solid-js";

import { createSignal, createEffect, indexArray } from "solid-js";

import { on, Show } from "solid-js";

import { validateEmail } from "../utils";
import { Button } from "../components";

import { useExports } from "../weclock/ExportProvider";

import { UPLOAD_CONSTANTS } from "../constants";
import { WeClockExport } from "../weclock/export";
import UploadProgress from "./UploadProgress";
import { useNavigate } from "solid-app-router";


import ExportCard from "./ExportCard";
import { useToast } from "../components/ToastProvider";

const ExportWizard: Component = () => {

  const [
    exportState,
    {
      setUserEmail,
      addExport,
    },
  ] = useExports();

  const [
    toastState,
    {
      setMessage,
    },
  ] = useToast();

  const [email, setEmail] = createSignal("");
  const navigate = useNavigate();

  // update store email if it's valid
  createEffect(on(email, (e) => (validateEmail(e) ? setUserEmail(e) : null)));

  const ErrorTag = ({ errorMsg }: { errorMsg: string }) => (
    <div class="flex flex-col border-2-rose-700 bg-rose-200 rounded-lg p-3 m-2">
      <p>{errorMsg}</p>
    </div>
  );

  return (
    <div class="flex flex-col content-center items-center justify-center w-full">
      <div
        class="sm:max-w-lg 
				w-full 
				p-5 
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
                  setError={(s: string) => setMessage({ msg: s, tailwindColor: "red-300" })} />)
            )}

          </div>

          <div class="grid grid-cols-1 gap-5 ">
            <Button
              class="col-span-1 sm:w-auto border border-gray-100 py-4"
              onClick={() => {
                addExport()
              }}
            >
              Add Participant
            </Button>
          </div>

          <UploadProgress
            exports={exportState.exports as WeClockExport[]}
            email={email()}
            setError={(s: string) => setMessage({ msg: s, tailwindColor: "red-300" })}
            onUploaded={() => navigate("/label")}
          />
        </form>
        <div class="h-16" />
      </div>
    </div >
  );
};

export default ExportWizard;
