import { Component, JSXElement, JSX } from 'solid-js'


export type ButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  class?: string;
} & JSX.HTMLAttributes<HTMLButtonElement>

const Button: Component<ButtonProps> = (props): JSXElement => {
  const onPressButton = (e: Event) => {
    e.preventDefault();
    return props.onClick();
  };
  const classString = `
  ${props.class}
    items-center
    justify-center
    p-2
    flex 
    bg-white
    border-4
    border-slate-500
    rounded-md
    tracking-wide
    text-slate-500 
    text-sm
    font-semibold  
    hover:bg-slate-100 
    hover:text-slate-700
    active:bg-slate-200 
    active:shadow-sm
    shadow-lg 
    cursor-pointer 
    transition 
    ease-in`;

  return (
    <button
      type="submit"
      onClick={onPressButton}
      disabled={props.disabled === undefined ? false : props.disabled}
      class={classString}
    >
      {props.children}
    </button>
  );
};

export default Button
