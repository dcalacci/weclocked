export default (props: { percent: number }) => {
  return (
    <div
      class="
                                      transition 
                                      ease-in 
                                      flex
                                      justify-center
                                      items-center"
    >
      <div class="w-12 h-12 flex">
        <div
          class="w-12 h-12 
                  rounded-full 
                  absolute
                  border-4 
                  border-solid 
                  border-gray-200"
        ></div>

        <div
          class="w-12 h-12 
                  rounded-full 
                  animate-spin 
                  absolute
                  border-4 
                  border-solid 
                  border-green-500 
                  border-t-transparent"
        ></div>
      </div>
      <p class="text-slate-500 font-semibold text-lg w-24 px-3">{`${props.percent}%`}</p>
    </div>
  );
};
