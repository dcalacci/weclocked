import { Accessor } from "solid-js";

export default (props: {
  text: Accessor<string>;
  setText: (text: string) => void;
  validator?: (text: string) => boolean;
  title?: string;
  description?: string;
  placeholder?: string;
  class?: string;
  inputClass?: string;
}) => {
  const onTextChange = (event: Event) => {
    if (event.target != null) {
      const text = (event.target as HTMLInputElement).value;
      props.setText(text);
    }
  };
  return (
    <div class={`grid grid-cols-1 ${props.class}`}>
      <label class="font-bold text-slate-600 tracking-wide">
        {props.title}
      </label>
      <span class="text-sm text-slate-500">{props.description}</span>
      <input
        onInput={onTextChange}
        value={props.text()}
        type="textarea"
        class={`
								${props.validator && props.validator(props.text())
            ? "border-emerald-400"
            : "border-rose-300"
          }
								${props.text() == "" ? "border-slate-400" : ""}
								transition 
								ease-in
								duration-400
								text-base
                mt-1
								p-2
								border-4
								rounded-lg
								focus:outline-none
                ${props.inputClass}
                `}
        placeholder={props.placeholder}
      />
    </div>
  );
};
