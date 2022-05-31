//@ts-ignore
import type { Component } from 'solid-js';
import { Routes, Route } from 'solid-app-router'

// import type { StoreNode, Store, SetStoreFunction } from "solid-js/store";

import ExportWizard from './login/ExportWizard'
import { Labeler } from './addExportInfo/ExportList'

import { ExportsProvider } from './weclock/ExportProvider'

import { useToast, ToastProvider } from './components/ToastProvider'
import * as icons from "solid-icons/hi";

const App: Component = () => {


  return (
    //@ts-ignore
    < ToastProvider >
      {/* @ts-ignore */}
      < ExportsProvider >
        <div class="container-fluid w-full bg-white h-screen">
          <div class="w-full h-full overflow-y-scroll z-0">
            <Routes>
              <Route path='/' element={<ExportWizard />} />
              <Route path='/label' element={<Labeler />} />
            </Routes>
          </div>

          <div class="flex flex-row show fixed bottom-1 w-full px-1 py-2 justify-center h-20 z-50">
            <div class="w-full h-full bg-white border-2 rounded-xl bottom-0 shadow-lg flex flex-row md:w-1/2">
              <div class="flex flex-1 justify-center text-xs font-bold text-center">
                <div class="flex flex-grow items-center justify-center space-x-4 px-6">
                  <a class="flex flex-col items-center group text-slate-500 hover:text-slate-700 py-1" href="/">
                    <icons.HiOutlineUpload class='w-6 h-6' />
                    <p>Upload</p>
                  </a>
                  <a class="flex flex-col items-center group text-slate-500 hover:text-slate-700 py-1" href="/label">
                    <icons.HiOutlineLocationMarker class='w-6 h-6' />
                    <p>Clusters</p>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ExportsProvider >
    </ToastProvider >
  );
};

export default App;
