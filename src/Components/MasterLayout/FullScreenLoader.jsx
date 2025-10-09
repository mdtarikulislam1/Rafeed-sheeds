import loadingStore from "../../Zustand/LoadingStore";

const FullScreenLoader = () => {
  const { globalLoader } = loadingStore();

  if (!globalLoader) return null;

  return (
    <>
      {/* Overlay blocking all clicks */}
      <div className="fixed inset-0 z-50 bg-transparent cursor-wait"></div>

      {/* Loading bar container */}
      <div className="fixed top-0 left-0 w-full h-1 z-50">
        {/* Animated loading bar */}
        <div
          className="h-[2px] bg-[#FF0000] fullScreen-loader" // change color to YouTube red or
        />
      </div>
    </>
  );
};

export default FullScreenLoader;
