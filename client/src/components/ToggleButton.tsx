

const ToggleButton = (props: { label: string, toggleState: boolean, onSetToggle: (toggleState: boolean) => void }) => {

  // const [checked, setChecked] = createSignal<boolean>(props.initState);

  // createEffect(on(checked, () => {
  //   console.log("setting toggle for label", props.label, checked())
  //   props.onSetToggle(checked())
  // }))

  return (
    <div class="flex items-center justify-center p-2">

      <label
        for={`toggle-${props.label}`}
        class="flex items-center cursor-pointer"
        onClick={() => {
          console.log(`${props.label} clicked!, ${props.toggleState} => ${!props.toggleState}`)
          props.onSetToggle(!props.toggleState)
        }}
      >
        <div class="relative">
          <input type="checkbox" id="toggleB" class="sr-only" />
          <div class={`block w-14 h-8 rounded-full ${props.toggleState ? 'bg-green-600' : 'bg-gray-300'}`}></div>
          <div class={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${props.toggleState ? 'translate-x-full' : ''}`}></div>
        </div>
        <div class="ml-3 text-gray-700 font-medium">
          {props.label}
        </div>
      </label>
    </div>

  )
}

export default ToggleButton
