import React, { useEffect, useState } from "react";

const PopUp = ({ message }) => {
  if (message) {
    return (
      <div
        className="fixed top-[70%] z-100 text-white bg-gray-800 p-1 px-5 rounded
       left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      >
        {message}
      </div>
    );
  }
};

export default PopUp;
