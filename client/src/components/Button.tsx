export default (props: {
  text: string;
  onClick: () => void;
  disabled: boolean;
  class?: string;
}) => {
  const onPressButton = (e: Event) => {
    e = e || window.event;
    e.preventDefault();
    props.onClick();
  };
  const classString = `my-5 
                              p-4
                              flex justify-center 
                              bg-white
                              border-4
                              border-slate-500
                              rounded-sm
                              tracking-wide
                              text-slate-500 
                              font-semibold  
                              hover:bg-slate-100 
                              hover:text-slate-700
                              active:bg-slate-200 
                              active:shadow-sm
                              shadow-lg 
                              cursor-pointer 
                              transition 
                              ease-in ${props.class}`;

  return (
    <button
      type="submit"
      onClick={onPressButton}
      disabled={props.disabled}
      class={classString}
    >
      {props.text}
    </button>
  );
};
