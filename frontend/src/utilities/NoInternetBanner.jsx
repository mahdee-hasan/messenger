import React, { useEffect, useState } from "react";
import { MdOutlineWifiOff } from "react-icons/md";

const NoInternetBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);

  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      className="bg-gray-100 h-[100vh] flex items-center justify-center
     text-gray-800 text-center  fixed top-16 left-0 right-0 z-100"
    >
      <div className="flex flex-col items-center pb-44 ">
        <MdOutlineWifiOff className="text-7xl" />
        <p> No internet connection. Please check your network.</p>
      </div>
    </div>
  );
};

export default NoInternetBanner;
