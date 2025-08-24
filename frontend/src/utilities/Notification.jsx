import React from "react";
import { IoPersonCircle } from "react-icons/io5";
import { useNavigate } from "react-router";

const Notification = ({ message }) => {
  const navigate = useNavigate();
  if (message) {
    return (
      <div className="fixed w-[60%] top-[70%] z-100 left-4">
        <div
          onClick={() => navigate(message.link)}
          className="p-4 rounded-xl flex flex-wrap justify-around items-center shadow-md border border-gray-200 dark:border-gray-700 
     bg-white dark:bg-gray-900 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800
      transition duration-200"
        >
          {message.pic ? (
            <img
              src={message.pic}
              alt="notification"
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <IoPersonCircle className="text-[40px]" />
          )}

          <div className="w-4/5">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
              {message.title}
            </h3>
            <p className="text-sm text-gray-600 w-full dark:text-gray-400">
              {message.description}
            </p>
          </div>
        </div>
      </div>
    );
  }
};

export default Notification;
