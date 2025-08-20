import React, { useEffect, useState, useMemo } from "react";
import { ClipLoader } from "react-spinners";
import "react-loading-skeleton/dist/skeleton.css";
import Skeleton from "react-loading-skeleton";
import { IoPersonCircle, IoSearch } from "react-icons/io5";
import { io } from "socket.io-client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { useLocation, useNavigate } from "react-router-dom";

// external imports
import PageTitle from "../utilities/PageTitle";
import SearchModal from "../components/inbox/SearchModal";
import ChatBox from "../components/inbox/ChatBox";
import useChatStore from "../stores/chatStore";
import timeAgo from "../hooks/timeAgo";

const socket = io(import.meta.env.VITE_API_URL, {
  withCredentials: true,
});

const Inbox = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeIds, setActiveIds] = useState([]);
  const [user, setUser] = useState({});
  const [users, setUsers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState({});
  const [unseenCount, setUnseenCount] = useState(0);
  const [isTyping, setIsTyping] = useState([]);

  const global = useChatStore((s) => s.setIsOpenGlobal);
  const setMsg = useChatStore((s) => s.setPopUpMessage);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const navigate = useNavigate();
  const searchedId = queryParams.get("id");
  useEffect(() => {
    if (searchedId) {
      handleOpenChat(searchedId);
    }
  }, [searchedId]);

  const getUnread = (conversation) => {
    return conversation.participant_1.id === user._id
      ? conversation.participant_1.unseenCount
      : conversation.participant_2.unseenCount;
  };

  useEffect(() => {
    closeAllCon();
  }, []);
  useEffect(() => {
    if (selectedConversation?.participant_1?.id === user?._id) {
      setUnseenCount(selectedConversation?.participant_2?.unseenCount);
    } else {
      setUnseenCount(selectedConversation?.participant_1?.unseenCount);
    }
  }, [selectedConversation]);

  const closeAllCon = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/inbox/close-all-con`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) {
        throw new Error("Error closing all Conversation");
      }
    } catch (error) {
      setMsg(error.message);
    }
  };
  // ✅ Load user only once on mount
  useEffect(() => {
    loadUser();
  }, [searchedId]);

  // ✅ Fetch conversations on selectedConversation or isOpen change
  useEffect(() => {
    fetchData();
  }, [selectedConversation, searchedId, isOpen, isTyping]);

  // ✅ Socket message listener
  useEffect(() => {
    const handleMessage = ({ data, updatedCon }) => {
      fetchData();
      loadUser();
      if (selectedConversation._id === updatedCon._id) {
        const isNotOpenForBoth = updatedCon.isOpen.length !== 2;

        if (updatedCon.participant_1.id === user._id && isNotOpenForBoth) {
          setUnseenCount(updatedCon.participant_2.unseenCount);
        } else if (
          updatedCon.participant_2.id === user._id &&
          isNotOpenForBoth
        ) {
          setUnseenCount(updatedCon.participant_1.unseenCount);
        } else if (updatedCon.isOpen.length === 2) {
          setUnseenCount(0);
        }
      }
    };
    socket.on("new_message", handleMessage);
    return () => {
      socket.off("new_message", handleMessage);
    };
  }, [conversations]);

  // ✅ Socket message listener
  useEffect(() => {
    const handleMessage = ({ message, updatedCon }) => {
      if (selectedConversation._id === updatedCon._id) {
        const isNotOpenForBoth = updatedCon.isOpen.length !== 2;

        if (updatedCon.participant_1.id === user._id && isNotOpenForBoth) {
          setUnseenCount(updatedCon.participant_2.unseenCount);
        } else if (
          updatedCon.participant_2.id === user._id &&
          isNotOpenForBoth
        ) {
          setUnseenCount(updatedCon.participant_1.unseenCount);
        } else if (updatedCon.isOpen.length === 2) {
          setUnseenCount(0);
        }
      }
    };
    socket.on("get_message", handleMessage);
    return () => {
      socket.off("get_message", handleMessage);
    };
  }, [conversations]);

  useEffect(() => {
    const handleTypingStarted = ({ conversationId, userId }) => {
      if (userId !== user._id) {
        setIsTyping((prev) =>
          prev.includes(conversationId) ? prev : [...prev, conversationId]
        );
      }
    };

    socket.on("typing-started", handleTypingStarted);
    return () => {
      socket.off("typing-started", handleTypingStarted);
    };
  }, [user._id]);

  useEffect(() => {
    const handleTypingStopped = ({ conversationId }) => {
      setIsTyping((prev) => prev.filter((id) => id !== conversationId));
    };

    socket.on("typing-stopped", handleTypingStopped);
    return () => {
      socket.off("typing-stopped", handleTypingStopped);
    };
  }, []);

  const loadUser = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch user data");
      const data = await res.json();
      setUsers([...data.users]);
      setUser({ ...data.user });
      return { success: true };
    } catch (error) {
      setMsg(error);
      return { success: false };
    }
  };

  const fetchData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/inbox`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch user data");
      const data = await res.json();
      setConversations(data.conversations);
      setActiveIds(data.activeIds);
    } catch (error) {
      setMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const openChatFromHead = async (id, name, avatar) => {
    const selectedCon = conversations.find(
      (con) => con.participant_2.id === id || con.participant_1.id === id
    );
    if (selectedCon) {
      handleOpenChat(selectedCon._id);
      return;
    }

    try {
      setIsLoading(true);
      const participant = { id, name, avatar };
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/inbox/conversation`,
        {
          method: "POST",
          body: JSON.stringify({ participant_2: participant }),
          headers: { "content-type": "application/json" },
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("failed to create a conversation");
      const feedback = await res.json();
      handleOpenChat(feedback.con._id);
    } catch (error) {
      setMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChat = async (id) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/inbox/open-chat/${id}`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) {
        throw new Error("error while opening chat");
      }
      const conversation = await res.json();
      setIsOpen(true);
      setSelectedConversation(conversation);
      global(true);
    } catch (error) {
      setMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseChat = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/inbox/close-chat/${id}`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) {
        throw new Error("error while closing chat");
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setIsOpen(false);
      setSelectedConversation({});
      global(false);
    }
  };

  const getParticipant = (con) => {
    return con.participant_1.id === user?._id
      ? con.participant_2
      : con.participant_1;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ClipLoader color="gray" loading={true} size={100} />
      </div>
    );
  }

  return (
    <div className=" max-w-3xl mx-auto md:max-h-[80vh] ">
      {!isSearchModalOpen && !isOpen && (
        <div
          className={`${
            isOpen ? "hidden" : "flex"
          } justify-center items-center h-14`}
        >
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="flex text-gray-500 space-x-4 items-center cursor-text 
            justify-start w-[90%] bg-gray-300 p-1 px-3 rounded-2xl"
          >
            <IoSearch />
            <p>search</p>
          </button>
        </div>
      )}

      {!isSearchModalOpen && !isOpen && (
        <div
          className={`${
            isOpen && isSearchModalOpen ? "hidden" : "flex"
          } h-20 overflow-x-auto items-center space-x-3 w-full px-4`}
        >
          <Swiper
            spaceBetween={5}
            slidesPerView={"auto"}
            freeMode
            className="cursor-grab"
          >
            {user && (
              <SwiperSlide style={{ width: "56px", height: "56px" }}>
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    className="w-12 mt-1 h-12 ring rounded-full object-cover"
                    alt="user"
                  />
                ) : (
                  <IoPersonCircle className="text-[48px] ml-1 mt-1 rounded-full ring" />
                )}
                <p className="text-[8px] text-center">you</p>
              </SwiperSlide>
            )}

            {users?.map((u) => (
              <SwiperSlide
                key={u._id}
                style={{ width: "56px", height: "70px" }}
                className="relative cursor-pointer"
                onClick={() => openChatFromHead(u._id, u.name, u.avatar)}
              >
                {u.avatar ? (
                  <img
                    src={u.avatar}
                    className="w-12 ml-1 mt-1 h-12 ring rounded-full object-cover"
                    alt="user"
                  />
                ) : (
                  <IoPersonCircle className="text-[48px] ml-1 mt-1 rounded-full ring" />
                )}
                <p className="text-[8px] truncate text-center">{u.name}</p>
                {u.active ? (
                  <div className="absolute right-1 bottom-4">
                    <span className="relative flex size-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                      <span className="relative inline-flex size-3 rounded-full bg-green-600"></span>
                    </span>
                  </div>
                ) : (
                  <div className="absolute text-[7px] max-w-12 bg-white ring-[0.5px] text-black rounded-full right-1 ring-green-400 bottom-4">
                    <p className="justify-self-center truncate my-auto text-shadow-2xs">
                      {timeAgo(u.updatedAt)}
                    </p>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      <PageTitle title="Inbox - Chat Application" />

      <div className="flex normal-case  md:mt-5 w-full">
        <div className="flex justify-between rounded-2xl w-full ">
          <div
            className={`${
              isOpen ? "hidden md:flex" : "w-full flex "
            } relative h-[90vh] md:h-[440px] flex-col items-center`}
          >
            <div className="flex flex-col min-w-65 truncate scrollbar-hide overflow-y-auto w-full px-2 py-1">
              {conversations.length && !isLoading > 0 ? (
                conversations.map((conversation) => {
                  const participant = getParticipant(conversation);
                  return (
                    <div
                      key={conversation._id}
                      onClick={() => {
                        navigate(`/inbox?id=${conversation._id}`);
                      }}
                      className={`flex relative cursor-pointer hover:bg-gray-100 rounded
                           mx-1 w-full space-x-4 px-3 items-center py-2 transition ${
                             selectedConversation?._id === conversation?._id
                               ? "bg-gray-50"
                               : ""
                           }`}
                    >
                      <div className="relative">
                        {participant?.avatar ? (
                          <img
                            src={participant?.avatar}
                            className="h-10 w-10 ring rounded-full object-cover"
                            alt="user"
                          />
                        ) : (
                          <IoPersonCircle className="text-[36px] rounded-full ring" />
                        )}
                        {activeIds.includes(participant?.id) && (
                          <div className="absolute right-0 bottom-0">
                            <span className="relative flex size-3">
                              <span
                                className="absolute inline-flex h-full w-full animate-ping
                                 rounded-full bg-green-500 opacity-75"
                              ></span>
                              <span className="relative inline-flex size-3 rounded-full bg-green-600"></span>
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-700 truncate">
                          {participant?.name}
                        </p>
                        <p
                          className={`text-sm truncate max-w-40 italic
                            ${
                              getUnread(conversation) > 0
                                ? "font-bold text-black"
                                : "text-gray-500 font-medium"
                            }`}
                        >
                          {isTyping.includes(conversation?._id) ? (
                            <span className="text-sm">Typing...</span>
                          ) : (
                            <span className="text-sm">
                              {conversation?.lastMessage.sender ===
                              participant.name
                                ? conversation?.lastMessage.text
                                : `You: ${
                                    conversation?.lastMessage.text ||
                                    "sent an attachment"
                                  }`}
                            </span>
                          )}
                        </p>
                      </div>
                      {getUnread(conversation) > 0 && (
                        <div className="absolute right-10 bottom-1/2">
                          <span className="relative flex size-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                            <span className="relative inline-flex size-3 rounded-full bg-red-600 "></span>
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : isLoading ? (
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
                ))
              ) : (
                <p className="mx-auto max-w-30">no conversations</p>
              )}
            </div>
          </div>

          <ChatBox
            isOpen={isOpen}
            selectedConversation={selectedConversation}
            func={handleCloseChat}
            allUser={users}
            user={user}
            unseenCount={unseenCount}
            isTyping={isTyping}
          />

          <SearchModal
            openFunc={openChatFromHead}
            isOpen={isSearchModalOpen}
            setIsOpen={setIsSearchModalOpen}
            onClose={() => setIsSearchModalOpen(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default Inbox;
