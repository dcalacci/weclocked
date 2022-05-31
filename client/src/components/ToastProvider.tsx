import { createContext, useContext, JSXElement, JSX, Show } from "solid-js";
import type { Component } from "solid-js";
import { createStore, Store } from 'solid-js/store';

// Actions and context
export type ToastState = Store<{
  msg: string
  displayed: boolean
  history: string[]
  tailwindColor: string
  textColor: string
}>;

export type ToastActions = {
  setMessage: (args: {
    msg: string, delay?: number,
    tailwindColor?: string,
    textColor?: string
  }) => void;
};

const ToastContext = createContext<[ToastState, ToastActions]>();


// Provider

const ToastProvider: Component = (props: JSX.HTMLAttributes<HTMLElement>): JSXElement => {

  const [state, setState] = createStore<ToastState>({
    msg: "",
    displayed: false,
    history: [],
    tailwindColor: 'slate-100',
    textColor: 'slate-800'
  })

  const store: [ToastState, ToastActions] = [
    state,
    {
      setMessage: ({ msg, delay, tailwindColor, textColor }) => {
        console.log("SETTING MESSAGE:", msg, delay, tailwindColor, textColor)
        setState({
          msg,
          displayed: true,
          tailwindColor,
          textColor,
          history: [...state.history, msg]
        })

        setTimeout(() => { setState('msg', ""); setState('displayed', false) }, delay || 10000)
      }
    }
  ]

  const ToastDialog = (props: { msg: string, tailwindColor?: string, textColor?: string }) => {
    console.log("tw color:", props.tailwindColor)
    //TODO: background color changing from useToast not working!
    return (
      <div class="show fixed top-5 md:top-20 w-full px-10 py-2 h-fit z-50">
        <div class={`rounded-lg shadow-lg p-5 bg-slate-100`}>
          <p class={`font-semibold text-` + props.textColor}>{props.msg}</p>
        </div>
      </div>
    )
  };

  return (
    <ToastContext.Provider value={store}>
      <Show when={state.displayed}>
        <ToastDialog {...state} />
      </Show>
      {props.children}
    </ToastContext.Provider>
  )
}

const useToast = (): [ToastState, ToastActions] => {
  //@ts-ignore
  return useContext<[ToastState, ToastActions]>(ToastContext);
};


export { ToastContext, ToastProvider, useToast };
