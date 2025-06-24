import React from "react";
import { toast, ToastContainer } from "react-toastify";
import SendMessage from "./SendMessage";
import Messages from "./Messages";
import { IoPersonCircle, IoTrash } from "react-icons/io5";
import { FaArrowCircleLeft } from "react-icons/fa";

const ChatBox = ({ isOpen, selectedUser, func }) => {
  const handleDeleteCon = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/inbox/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) {
        throw new Error("failed to delete");
      }
      const data = await res.json();
      toast(data.message);
      setTimeout(() => {
        location.reload();
      }, 1000);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <div
        className={`bg-slate-600 ${
          isOpen ? " w-full" : " hidden md:flex"
        }  relative text-white h-[90vh] md:h-[500px] md:w-3/4
          flex-col items-center justify-baseline rounded-r-2xl`}
      >
        <FaArrowCircleLeft
          onClick={() => {
            func(false);
          }}
          className="absolute md:hidden cursor-pointer
         left-0.5 top-0.5 text-2xl text-gray-700 bg-white rounded-full"
        />
        {isOpen ? (
          <div className="w-full h-full">
            <div className="flex items-center justify-around h-2/12 w-full bg-slate-500">
              {selectedUser.participant.avatar ? (
                <img
                  src={selectedUser.participant.avatar}
                  className="h-10 w-10 aspect-square object-cover rounded-full"
                  alt="selectedUser"
                />
              ) : (
                <IoPersonCircle className="text-[56px]" />
              )}
              <p>{selectedUser.participant.name}</p>
              <IoTrash
                className="cursor-pointer text-red-500"
                onClick={() => {
                  handleDeleteCon(selectedUser._id);
                }}
              />
            </div>
            <div className="w-full flex flex-col p-3 h-10/12 justify-end">
              <Messages id={selectedUser._id} />
              <div className="w-full">
                <SendMessage id={selectedUser._id} />
              </div>
            </div>
          </div>
        ) : (
          <p className="flex w-full h-full items-center justify-center">
            select a user to talk
          </p>
        )}
      </div>
    </>
  );
};

export default ChatBox;
