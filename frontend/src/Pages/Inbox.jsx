import React, { useEffect, useState } from "react";
import PageTitle from "../components/PageTitle";
import { IoPersonCircle } from "react-icons/io5";
import { RiUserAddFill } from "react-icons/ri";
import SearchModal from "../components/SearchModal";
import { toast, ToastContainer } from "react-toastify";
import { io } from "socket.io-client";
import ChatBox from "../components/ChatBox";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const socket = io(import.meta.env.VITE_API_URL);

const Inbox = () => {
  const [conversations, setConversations] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [lasMessages, setLastMessages] = useState({});

  useEffect(() => {
    fetchData();
  }, [selectedUser]);

  useEffect(() => {
    const handleMessage = (data) => {
      fetchData();
    };

    socket.on("new_message", handleMessage);

    return () => {
      socket.off("new_message", handleMessage);
    };
  }, [conversations]);
  const fetchData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/inbox`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch user data");
      }
      const data = await res.json();
      setConversations(data);

      data.forEach((conversation) => {
        fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/inbox/last-message?conversation_id=${conversation._id}&person=${
            conversation.creator.id
          }`,
          {
            credentials: "include",
          }
        )
          .then((res) => res.json())
          .then((data) => {
            setLastMessages((prev) => ({
              ...prev,
              [conversation.participant.name]: {
                msg: data.lastMessage,
                sender: data.sender,
              },
            }));
          })
          .catch((err) =>
            setLastMessages((prev) => ({
              ...prev,
              [conversation.participant.name]: err.messages,
            }))
          );
      });
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Something went wrong");
    }
  };
  const handleOpenChat = (conversation) => {
    setIsOpen(true);
    setSelectedUser(conversation);
  };
  const handleCloseChat = (value) => {
    setIsOpen(value);
  };

  return (
    <div className="flex justify-center md:mt-5 w-full">
      <PageTitle title="Inbox - Chat Application" />
      <ToastContainer />

      <div className="flex justify-center rounded-2xl w-full md:w-[90%] bg-slate-400">
        {/* Contact List */}
        <div
          className={`${
            isOpen ? "hidden md:flex md:flex-[1]" : "w-full flex md:flex-[1]"
          } relative h-[90vh] md:h-[440px] flex-col items-center`}
        >
          <div className="h-14 bg-emerald-400 text-2xl uppercase ring-2 text-center p-2 text-white font-bold ring-sky-500 rounded ring-offset-0 w-full">
            Contacts
          </div>

          {/* Conversations */}
          <div className="flex flex-col scrollbar-hide overflow-y-auto w-full px-2 py-1">
            {conversations
              ? conversations.map((conversation) => (
                  <div
                    key={conversation._id}
                    onClick={() => handleOpenChat(conversation)}
                    className={`flex cursor-pointer hover:bg-gray-200 rounded border-b border-gray-400 mx-1 w-full space-x-4 px-3 items-center py-2 transition ${
                      selectedUser._id === conversation.participant._id
                        ? "bg-gray-100"
                        : "bg-gray-300"
                    }`}
                  >
                    {conversation.participant.avatar ? (
                      <img
                        src={conversation.participant.avatar}
                        className="h-9 w-9 rounded-full object-cover"
                        alt="user"
                      />
                    ) : (
                      <IoPersonCircle className="text-[36px]" />
                    )}

                    <div className="flex-1">
                      <p className="text-xl font-bold text-gray-700 truncate">
                        {conversation.participant.name}
                      </p>
                      <p className="text-sm text-gray-500 italic">
                        {(() => {
                          const msgData =
                            lasMessages[conversation.participant.name];
                          const isSender =
                            msgData?.sender === conversation.participant.name;
                          const msg = msgData?.msg || "sent an attachment";
                          const trimmedMsg =
                            msg.length > 25 ? "..." + msg.slice(-25) : msg;
                          return isSender ? trimmedMsg : `You: ${trimmedMsg}`;
                        })()}
                      </p>
                    </div>
                  </div>
                ))
              : // Skeleton Loading UI
                [...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-4 px-3 py-2 w-full"
                  >
                    <Skeleton circle width={36} height={36} />
                    <div className="flex-1">
                      <Skeleton height={16} width="60%" />
                      <Skeleton height={12} width="40%" />
                    </div>
                  </div>
                ))}
          </div>

          {/* Add Contact Button */}
          <RiUserAddFill
            onClick={() => setIsSearchModalOpen(true)}
            className="absolute bottom-8 md:-bottom-12 left-3 text-4xl
             text-emerald-500 ring ring-offset-0 bg-gray-500
              rounded-full cursor-pointer p-1 hover:scale-110 transition"
          />
        </div>

        {/* Chat Box */}
        <ChatBox
          isOpen={isOpen}
          selectedUser={selectedUser}
          func={handleCloseChat}
        />
      </div>
      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </div>
  );
};

export default Inbox;
