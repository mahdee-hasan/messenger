import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import moment from "moment";
import { IoPersonCircle } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";
import SingleMessage from "./SingleMessage";

const socket = io(import.meta.env.VITE_API_URL);

const Messages = ({ id }) => {
  const [messages, setMessages] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [messageEditSlot, setMessageEditSlot] = useState(null);
  const [messageDeleting, setMessageDeleting] = useState(1);
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("username")).value
  );
  const bottomRef = useRef(null);

  useEffect(() => {
    if (id) getMessage(id);
  }, [id, messageDeleting]);
  useEffect(() => {
    const handleMessage = (data) => {
      if (data.conversation_id === id) setMessages((prev) => [...prev, data]);
    };
    socket.on("new_message", handleMessage);
    return () => socket.off("new_message", handleMessage);
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getMessage = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/inbox/message/${id}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error("Error getting messages");
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/inbox/everyone/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await res.json();
      setActiveMenu(null);
      if (!res.ok) throw new Error("error deleting message");
    } catch (err) {
      console.error(err);
    }
  };
  const handleMessageDeleting = (value) => {
    setMessageDeleting(value);
  };
  return (
    <div className="w-full flex flex-col p-3 h-full overflow-y-auto scrollbar-hide">
      {messages.length ? (
        messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex items-center my-2 relative ${
              msg.sender.name === user ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender.name !== user ? (
              msg.sender.avatar ? (
                <img
                  src={msg.sender.avatar}
                  className="h-8 w-8 mr-3 ring-2 ring-blue-500 rounded-full object-cover"
                  alt="user"
                />
              ) : (
                <IoPersonCircle className="text-4xl" />
              )
            ) : null}

            <BsThreeDotsVertical
              className="cursor-pointer ml-2"
              onClick={() =>
                setActiveMenu((prev) => (prev === msg._id ? null : msg._id))
              }
            />

            <SingleMessage
              message={msg}
              user={user}
              activeMenu={activeMenu}
              messageEditSlot={messageEditSlot}
              onEditToggle={(id) =>
                setMessageEditSlot((prev) => (prev === id ? null : id))
              }
              onMenuToggle={(id) =>
                setActiveMenu((prev) => (prev === id ? null : id))
              }
              onDelete={handleDelete}
              func={handleMessageDeleting}
            />

            <p
              className={`text-[10px] text-gray-300 absolute -bottom-3.5 ${
                msg.sender.name !== user ? "left-12" : ""
              }`}
            >
              {moment(msg.createdAt).fromNow()}
            </p>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-300 mt-4">No messages yet</p>
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default Messages;
