import type { Component } from 'solid-js';
import { Routes, Route } from 'solid-app-router'

// import type { StoreNode, Store, SetStoreFunction } from "solid-js/store";

import ExportWizard from './login/ExportWizard'
import { Labeler } from './addExportInfo/ExportList'

import { ExportsProvider } from './weclock/ExportProvider'

const App: Component = () => {
  return (
    <ExportsProvider>
      <div class="container-fluid w-full bg-white">
        <nav class="flex flex-wrap items-center py-3 bg-white border-orange-300 border-2 hover:text-underline m-5 rounded-lg drop-shadow-sm">
          <div class="container-fluid flex-wrap items-center justify-between px-6">
            <a class="text-xl text-slate-600 font-semibold">WeClocked</a>
          </div>

          <div class="flex flex-grow items-center justify-end space-x-4 px-6">
            <a href="/upload" class="text-l text-slate-500 font-semibold hover:text-slate-700">Upload</a>
            <a href="/label" class="text-l text-slate-500 font-semibold hover:text-slate-700">Label</a>

          </div>
        </nav>
        <Routes>
          <Route path='/upload' element={<ExportWizard />} />
          <Route path='/label' element={<Labeler />} />
        </Routes>
      </div>
    </ExportsProvider>
  );
};

export default App;
