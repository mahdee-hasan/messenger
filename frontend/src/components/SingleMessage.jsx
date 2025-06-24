// SingleMessage.js
import React, { useState } from "react";
import { useEffect } from "react";
import { FaRegEdit } from "react-icons/fa";
import { FaRegCircleXmark } from "react-icons/fa6";
import { IoSend, IoTrash } from "react-icons/io5";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL);

const SingleMessage = ({
  message,
  user,
  activeMenu,
  messageEditSlot,
  onEditToggle,
  onMenuToggle,
  onDelete,
  func,
}) => {
  const [upMsg, setUpMsg] = useState(message.text);
  const isOwn = message.sender.name === user;
  const isActive = activeMenu === message._id;
  const isEditing = messageEditSlot === message._id;
  useEffect(() => {
    const handleMessage = (data) => {
      if (data.acknowledged === true) {
        func(Math.random());
      }
    };
    socket.on("deleted_message", handleMessage);
    return () => socket.off("deleted_message", handleMessage);
  }, [onDelete]);
  const onMessageSubmit = (e) => {
    setUpMsg(e.target.value);
  };
  const updateMessage = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/inbox/editMessage/${id}`,
        {
          method: "POST",
          body: JSON.stringify({ text: upMsg }),
          headers: {
            "content-type": "application/json",
          },
          credentials: "include",
        }
      );
      if (!res.ok) {
        throw new Error("error updating message");
      }
      const data = await res.json();
    } catch (error) {
      console.error(error.message);
    }
  };
  const handleDeleteForMe = async (id) => {
    try {
      const res = fetch(
        `${import.meta.env.VITE_API_URL}/api/inbox/forMe/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) {
        throw new Error("error deleting message");
      }
      const data = await res.json();
    } catch (error) {
      console.error(error.message);
    }
  };
  return (
    <div
      onClick={() => {
        onMenuToggle(message._id);
        onEditToggle(null);
      }}
      className={`px-2 py-1 normal-case shadow-md break-words space-x-2 flex justify-between rounded-t-xl
        ${
          isOwn
            ? "bg-blue-500 text-white rounded-bl-xl"
            : "bg-white text-blue-500 rounded-br-xl"
        }
        ${
          isActive && !message.deletedFor.includes("everyone")
            ? ` ${isOwn ? "min-w-[95%]" : "max-w-[70%]"}  ring-2"`
            : "max-w-[70%]"
        }`}
    >
      <div
        className={
          isActive && !message.deletedFor.includes("everyone")
            ? "bg-gray-700 rounded-2xl max-w-[66%] p-1"
            : ""
        }
      >
        {isEditing ? (
          <>
            <form
              className="relative flex items-center"
              onClick={() => updateMessage(message._id)}
            >
              <input
                className="outline-none min-w-[400px] px-2"
                type="text"
                name="text"
                value={upMsg}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onChange={onMessageSubmit}
              />
              <button type="submit" className="absolute -right-6 z-10">
                {" "}
                <IoSend
                  className=" text-gray-200 cursor-pointer"
                  onClick={() => updateMessage(message._id)}
                />
              </button>
            </form>
          </>
        ) : (
          message.text
        )}

        {!message.deletedFor.includes("everyone") &&
          message.attachment?.map((pic) => (
            <img
              key={pic}
              src={pic.url}
              alt="attachment"
              className="max-h-20 max-w-32"
            />
          ))}
      </div>

      {isActive && !message.deletedFor.includes("everyone") && (
        <div
          className="text-2xl w-40 flex justify-end space-x-12 items-center cursor-pointer text-gray-900"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {isOwn && (
            <>
              <IoTrash
                title="delete for everyone"
                onClick={() => onDelete(message._id)}
              />
              <FaRegEdit
                title="edit"
                onClick={() => onEditToggle(message._id)}
              />
            </>
          )}
          <FaRegCircleXmark
            title="delete for me"
            onClick={() => {
              handleDeleteForMe(message._id);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default SingleMessage;
