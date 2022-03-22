import type { Component } from 'solid-js';

import GoogleLogin from './login/GoogleLogin'

const App: Component = () => {
  return (
    <div class="container-fluid w-full bg-white">
      <nav class="flex flex-wrap items-center py-3 bg-white border-orange-300 border-2 hover:text-underline m-5 rounded-lg drop-shadow-sm">
        <div class="container-fluid w-full flex-wrap items-center justify-between px-6">
          <a class="text-xl text-slate-600 font-semibold">Workbox</a>
        </div>

      </nav>
      <GoogleLogin />
    </div>
  );
};

export default App;
