import { Accessor, Setter } from "solid-js";
import { UPLOAD_CONSTANTS } from "../constants";

export default (props: {
  text: Accessor<string>
  setText: Setter<string>
  validator?: (text: string) => boolean
  placeholder?: string
}) => {
  const onTextChange = (event: Event) => {
    if (event.target != null) {
      const text= (event.target as HTMLInputElement).value;
      props.setText(text);
    }
  };
  return (
    <div class="grid grid-cols-1 space-y-2">
      <label class="text-lg font-bold text-slate-600 tracking-wide">
        {UPLOAD_CONSTANTS.EMAIL_TITLE}
      </label>
      <span class="text-sm text-slate-500">{UPLOAD_CONSTANTS.EMAIL_DESC}</span>
      <input
        onInput={onTextChange}
        value={props.text()}
        type="text"
        class={`
								${props.validator && props.validator(props.text()) ? "border-emerald-400" : "border-rose-300"}
								${props.text() == "" ? "border-slate-400" : ""}
								transition 
								ease-in
								duration-400
								text-base
								p-2
								border-4
								rounded-sm
								focus:outline-none`}
        placeholder={props.placeholder}
      />
    </div>
  );
};