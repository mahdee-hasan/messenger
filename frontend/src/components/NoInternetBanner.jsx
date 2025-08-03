import React, { useEffect, useState } from "react";

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
    <div className="bg-red-500 text-white text-center p-2 fixed top-0 left-0 right-0 z-50">
      ⚠️ No internet connection. Please check your network.
    </div>
  );
};

export default NoInternetBanner;
