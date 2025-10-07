import React from "react";

const LazyLoader = () => {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay blocking all clicks */}
      <div className="absolute inset-0 bg-transparent cursor-wait"></div>

      {/* Loading bar container */}
      <div className="absolute top-0 left-0 w-full h-[2px] overflow-hidden">
        {/* Animated loading bar */}
        <div
          className="absolute h-full w-[80%] bg-gradient-to-r from-transparent via-red-600 to-transparent animate-class"
        />
      </div>
    </div>
  );
};

export default LazyLoader;
