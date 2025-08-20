// SingleMessage.js
import React, { useState } from "react";
import { useEffect } from "react";
import { FaRegEdit } from "react-icons/fa";
import { FaRegCircleXmark } from "react-icons/fa6";
import { IoSend, IoTrash } from "react-icons/io5";
import { io } from "socket.io-client";
import { BsThreeDotsVertical } from "react-icons/bs";
import useChatStore from "../../stores/chatStore";

const socket = io(import.meta.env.VITE_API_URL, {
  withCredentials: true,
});

const SingleMessage = ({
  message,
  userId,
  activeMenu,
  messageEditSlot,
  onEditToggle,
  onMenuToggle,
  onDelete,
  func,
}) => {
  const [upMsg, setUpMsg] = useState(message.text);
  const isOwn = message.sender.id === userId;
  const isActive = activeMenu === message._id;
  const isEditing = messageEditSlot === message._id;

  const setMsg = useChatStore((s) => s.setPopUpMessage);

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
      setMsg(error.message);
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
      setMsg(error.message);
    }
  };
  const attachmentClicked = (url) => {
    window.open(url, "_blank");
  };
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onEditToggle(null);
        onMenuToggle(null);
      }}
      className={` cursor-pointer normal-case shadow-md break-words
          flex relative items-center justify-between rounded-t-xl
         max-w-2/3
        ${
          isOwn
            ? "bg-blue-500 text-white border border-gray-300/50 rounded-bl-xl"
            : "bg-white text-black rounded-br-xl"
        }
        `}
    >
      <div>
        {" "}
        {message.attachment.length > 0 && (
          <div
            className="overflow-hidden flex-wrap p-1
         flex justify-center bg-gray-50 rounded-t-xl"
          >
            {!message.deletedFor.includes("everyone") &&
              message.attachment?.map((pic) => (
                <img
                  key={pic.url}
                  src={pic.url}
                  alt="attachment"
                  className={` aspect-auto ${
                    message.attachment.length === 1
                      ? "w-full"
                      : message.attachment.length === 2
                      ? "w-1/2"
                      : "w-1/3"
                  } `}
                  onClick={(e) => {
                    e.stopPropagation();
                    attachmentClicked(pic.url);
                  }}
                />
              ))}
          </div>
        )}
        {isEditing ? (
          <>
            <form
              className="relative flex items-center"
              onClick={() => updateMessage(message._id)}
            >
              <input
                className="outline-none border w-72 bg-white rounded-xl rounded-br-none p-1 text-black px-2"
                type="text"
                name="text"
                value={upMsg}
                autoFocus
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onChange={onMessageSubmit}
              />
              <button
                type="submit"
                className="absolute right-0 h-full px-1 rounded-tr-xl border border-black border-l-0 bg-gray-200 z-10"
              >
                {" "}
                <IoSend
                  className=" text-gray-500 cursor-pointer"
                  onClick={() => updateMessage(message._id)}
                />
              </button>
            </form>
          </>
        ) : message.text ? (
          <p className="px-2 py-1"> {message.text}</p>
        ) : (
          ""
        )}
      </div>

      <div
        className={`absolute text-gray-600 ${isOwn ? "-left-4" : "-right-4"} `}
        onClick={(e) => {
          e.stopPropagation();
          onMenuToggle(message._id);
          onEditToggle(null);
        }}
      >
        {" "}
        <div className="relative">
          <BsThreeDotsVertical />
          {isActive && !message.deletedFor.includes("everyone") && (
            <div
              className={`text-xs rounded-2xl ring  absolute flex flex-col
                 bottom-4 bg-white min-w-32 justify-baseline ${
                   isOwn ? "right-3 rounded-br-none" : "left-3 rounded-bl-none"
                 }
               items-start cursor-pointer text-gray-700`}
              onClick={(e) => {}}
            >
              {isOwn && (
                <>
                  <p
                    title="delete for everyone"
                    className="hover:bg-gray-300 shadow-2xl shadow-black p-2 w-full rounded-t-2xl"
                    onClick={(e) => {
                      onDelete(message._id);
                    }}
                  >
                    delete for everyone
                  </p>
                  <p
                    title="edit"
                    className="hover:bg-gray-300  shadow-2xl shadow-black  p-2 w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditToggle(message._id);
                    }}
                  >
                    edit
                  </p>
                </>
              )}
              <p
                className={`hover:bg-gray-300 p-2 w-full ${
                  isOwn ? " rounded-bl-2xl" : "rounded-2xl rounded-bl-none"
                }`}
                title="delete for me"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteForMe(message._id);
                }}
              >
                delete for me
              </p>
            </div>
          )}{" "}
        </div>{" "}
      </div>
    </div>
  );
};

export default SingleMessage;
