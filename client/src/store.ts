import {
  createEffect,
  createSignal,
  on,
} from "solid-js";
import { createStore, unwrap } from "solid-js/store";
import type { Store, SetStoreFunction } from "solid-js/store";

import { getStorage } from "@sifrr/storage";

console.log("get storage?", getStorage);
const storage = getStorage("indexeddb");

//TODO: trying to make the overall state persist in local storage here.
// the game is to convert our file objects to blobs that we can:
// (a) upload
// (b) parse so we can send limited data to our server
// (c) save locally so people don't lose their place when they leave
// storageKey is the key used inside of SifrrStorage. Think of it as a scope for data objects.
function createLocalStore<T>(
  initState: T,
  storageKey: string = "defaultKey"
): [Store<T>, SetStoreFunction<T>] {
  const [state, setStore] = createStore<T>(initState);
  const [triggerUpdate, setTriggerUpdating] = createSignal<number>(1);

  // initialize the store with data from local storage
  storage.get(storageKey).then((v) => {
    if (v) {
      //@ts-ignore
      let val = v[storageKey];
      setState(val);
    }
  });

  // automatically sets our store any time there is a change
  //@ts-ignore
  const setState: typeof setStore = (...args) => {
    setTriggerUpdating((v) => v + 1);
    //@ts-ignore
    setStore(...args);
  };

  createEffect(on(triggerUpdate, () => storage.set(storageKey, unwrap(state))));

  return [state, setState];
}

export { createLocalStore };
