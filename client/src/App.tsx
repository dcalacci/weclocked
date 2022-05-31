import type { Component } from 'solid-js';
import { Routes, Route } from 'solid-app-router'

// import type { StoreNode, Store, SetStoreFunction } from "solid-js/store";

import ExportWizard from './login/ExportWizard'
import { Labeler } from './addExportInfo/ExportList'

import { ExportsProvider } from './weclock/ExportProvider'
import * as icons from "solid-icons/hi";

const App: Component = () => {
  return (
    <ExportsProvider>
      <div class="container-fluid w-full bg-white h-screen md:pb-0">
        <nav class="hidden md:block md:flex flex-wrap items-center py-3 bg-white border-orange-300 border-2 hover:text-underline m-5 rounded-lg drop-shadow-sm">
          <div class="container-fluid flex-wrap items-center justify-between px-6">
            <a class="text-xl text-slate-600 font-semibold">WeClocked</a>
          </div>

          <div class="flex flex-grow items-center justify-end space-x-4 px-6">
            <a href="/" class="text-l text-slate-500 font-semibold hover:text-slate-700">Upload</a>
            <a href="/label" class="text-l text-slate-500 font-semibold hover:text-slate-700">Label</a>

          </div>
        </nav>
        <div class="w-full h-full overflow-y-scroll">
          <Routes>
            <Route path='/' element={<ExportWizard />} />
            <Route path='/label' element={<Labeler />} />
          </Routes>
        </div>

        <div class="show md:hidden fixed bottom-1 w-full px-1 py-2 h-fit">
          <div class="w-full h-full bg-white border-2 rounded-xl bottom-0 shadow-lg flex flex-row md:relative">
            <div class="flex flex-1 justify-center text-xs font-bold text-center md:flex-none md:justify-start">
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
    </ExportsProvider>
  );
};

export default App;
