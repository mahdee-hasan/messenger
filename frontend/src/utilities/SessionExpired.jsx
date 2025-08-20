import React, { useEffect } from "react";
import picture from "../assets/pic.png";
import useChatStore from "../stores/chatStore";
const SessionExpired = ({ data }) => {
  const setMsg = useChatStore((s) => s.setPopUpMessage);

  useEffect(() => {
    if (data) {
      console.log("please login to chat");
      setMsg("please re-login");
    } else {
      console.error(data);
      setMsg(data);
    }
  }, [data]);
  return (
    <div className="flex max-w-2xl mx-auto h-[90vh]">
      <div
        className="text-gray-900  h-40 justify-between flex
       flex-col  lowercase tracking-widest"
      >
        <p>
          hi{" "}
          <span className="text-3xl font-bold text-emerald-700 uppercase">
            guest
          </span>{" "}
          ,
          <br /> make your day with our chat . app you need to login first chat{" "}
          <br />{" "}
        </p>
        <a
          href="/login"
          className="ml-20 uppercase p-3 max-w-24 px-4 rounded-xl hover:ring hover:bg-white hover:text-emerald-500
           bg-emerald-500"
        >
          LOGIN
        </a>
      </div>
    </div>
  );
};

export default SessionExpired;
