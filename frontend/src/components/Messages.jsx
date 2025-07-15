import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { IoPersonCircle } from "react-icons/io5";
import SingleMessage from "./SingleMessage";
import useChatStore from "../stores/chatStore";

const socket = io(import.meta.env.VITE_API_URL, {
  withCredentials: true,
});

const Messages = ({ id, participant, unseenCount, isTyping }) => {
  const [message, setMessage] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [messageEditSlot, setMessageEditSlot] = useState(null);
  const [messageDeleting, setMessageDeleting] = useState(1);
  const userId = JSON.parse(localStorage.getItem("userId"))?.value;
  const bottomRef = useRef(null);

  const setMsg = useChatStore((s) => s.setPopUpMessage);

  useEffect(() => {
    if (id) getMessage(id);
  }, [id, messageDeleting]); // ✅ fixed dependencies

  useEffect(() => {
    const handleMessage = ({ data, updatedCon }) => {
      setMessageDeleting((n) => n + 1);
    };

    socket.on("new_message", handleMessage);
    return () => socket.off("new_message", handleMessage);
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message, isTyping]);

  const getMessage = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/inbox/message/${id}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error("Error getting messages");

      // ✅ Ensure this matches your backend response structure
      setMessage(data || []);
    } catch (err) {
      setMsg("Fetch message error:", err);
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
      if (!res.ok) throw new Error("error deleting message");
      setActiveMenu(null);
    } catch (err) {
      setMsg(err);
    }
  };

  const handleMessageDeleting = (value) => {
    setMessageDeleting(value);
  };

  const onEditToggle = (id) => {
    setMessageEditSlot((prev) => (prev === id ? null : id));
  };

  const onMenuToggle = (id) => {
    setActiveMenu((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className="w-full flex flex-col p-3 h-full overflow-y-auto scrollbar-hide"
      onClick={() => {
        setActiveMenu(null);
        setMessageEditSlot(null);
      }}
    >
      {message.length ? (
        <>
          {message.map((msg, index) => {
            const showSeenMarker = index === message.length - unseenCount - 1;
            return (
              <React.Fragment key={msg._id}>
                <div
                  className={`flex items-center my-1 relative ${
                    msg.sender.id === userId ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.sender.id !== userId ? (
                    msg.sender.avatar ? (
                      <img
                        src={msg.sender.avatar}
                        className="h-6 w-6 mr-3 ring-2 mt-3 ring-blue-500 rounded-full object-cover"
                        alt="user"
                      />
                    ) : (
                      <IoPersonCircle className="text-[28px] mt-3 text-gray-700" />
                    )
                  ) : null}

                  <SingleMessage
                    message={msg}
                    userId={userId}
                    activeMenu={activeMenu}
                    messageEditSlot={messageEditSlot}
                    onEditToggle={onEditToggle}
                    onMenuToggle={onMenuToggle}
                    onDelete={handleDelete}
                    func={handleMessageDeleting}
                  />
                </div>

                {showSeenMarker && (
                  <div className="flex w-full mt-2 justify-end">
                    {participant.avatar ? (
                      <img
                        src={participant.avatar}
                        alt="user"
                        className="h-3 w-3 object-cover rounded-full ring ring-black"
                      />
                    ) : (
                      <IoPersonCircle className="text-[12px] text-black rounded-full ring ring-black" />
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
          {isTyping.includes(id) && (
            <div className="flex h-20 items-center text-sm text-gray-500">
              {participant.avatar ? (
                <img
                  src={participant.avatar}
                  className="h-6 w-6 mr-3 ring-2 mt-3 ring-blue-500 rounded-full object-cover"
                  alt="user"
                />
              ) : (
                <IoPersonCircle className="text-[28px] mt-3 text-gray-700" />
              )}
              <p className="bg-white normal-case shadow-md p-1.5 text-blue-500 rounded-xl rounded-bl-none">
                {" "}
                Typing...
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-gray-300 mt-4">No messages yet</p>
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default Messages;
