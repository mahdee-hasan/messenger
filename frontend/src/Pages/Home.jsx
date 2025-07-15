// internal imports
import React, { useEffect } from "react";
// external imports
import picture from "../assets/pic.png";
// receive the props as data passed from app component
const Home = ({ data }) => {
  //since there is no dynamic changes return static page
  return (
    <div className="flex h-[90vh] relative items-center justify-center">
      {/* an image which will be displayed in the homepage */}
      <img
        src={picture}
        alt="img"
        className="fixed left-0 bottom-0 -z-10 h-[70vh]"
      />
      {/* welcome message */}
      <div
        className="text-gray-900 h-40 justify-between flex
       flex-col  lowercase tracking-widest"
      >
        <p
          className="text-sm md:text-xl text-shadow-lg
         text-shadow-black text-white"
        >
          hi{" "}
          <span
            className="text-xl md:text-3xl font-bold
           text-amber-300  uppercase"
          >
            {data.name}
          </span>{" "}
          ,
          <br /> make your day with our chat .
        </p>
        {/* two buttons to go another routes */}
        <div className="flex space-x-3.5">
          <a
            href={`/user-info/${data._id}`}
            className="uppercase p-3 max-w-44 ma px-4 rounded-xl hover:ring hover:bg-white hover:text-emerald-500
           bg-emerald-500"
          >
            your-info
          </a>

          <a
            href="/inbox"
            className=" uppercase p-3 max-w-24 px-4 rounded-xl hover:ring hover:bg-white hover:text-emerald-500
           bg-emerald-500"
          >
            inbox
          </a>
        </div>
      </div>
    </div>
  );
};
//export the component
export default Home;
