import { useEffect, useState } from "react";
import SendMessage from "./SendMessage";
import Messages from "./Messages";
import { IoPersonCircle, IoTrash } from "react-icons/io5";
import { FaArrowCircleLeft } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import useChatStore from "../stores/chatStore";
import timeAgo from "../hooks/timeAgo";

const ChatBox = ({
  isOpen,
  selectedConversation,
  func,
  allUser,
  user,
  unseenCount,
  isTyping,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [senderDetails, setSenderDetails] = useState(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(true);

  const setPopMsg = useChatStore((s) => s.setPopUpMessage);

  useEffect(() => {
    if (
      allUser?.length &&
      selectedConversation?.participant_1 &&
      selectedConversation?.participant_2
    ) {
      const targetId =
        selectedConversation.participant_1.id === user._id
          ? selectedConversation.participant_2.id
          : selectedConversation.participant_1.id;

      const userObject = allUser.find((u) => u._id === targetId);
      setSenderDetails(userObject);
      setUserDetailsLoading(false);
    } else {
      setSenderDetails(null); // fallback if invalid
    }
  }, [selectedConversation, allUser, user._id]);

  const handleDeleteCon = async (id) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/inbox/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) {
        throw new Error((await res.json()).message || "failed to delete");
      }
      const data = await res.json();
      setPopMsg("conversation deleted successfully");
      func(id);
    } catch (error) {
      console.error("Delete Error:", error.message);
      setPopMsg("there is a problem deleting conversation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={` ${
        isOpen ? "flex w-full z-50" : "hidden md:flex md:w-full"
      } relative text-white bg-white h-[100vh] md:h-[88vh] flex-col items-start justify-between`}
    >
      <FaArrowCircleLeft
        onClick={() => func(selectedConversation._id)}
        className="absolute md:hidden cursor-pointer left-0.5 top-0.5 text-2xl text-gray-700 bg-white rounded-full"
      />

      {isOpen ? (
        <div className="w-full h-full flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center border-gray-300/50 h-1/9 shadow justify-around border-b w-full">
            <div className="relative">
              {senderDetails?.avatar ? (
                <img
                  src={senderDetails.avatar}
                  className="h-8 w-8 ring-2 ring-gray-700 aspect-square object-cover rounded-full"
                  alt="selectedConversation"
                />
              ) : (
                <IoPersonCircle className="text-[32px] text-gray-700 ring-2 ring-gray-700 rounded-full" />
              )}

              {/* Active indicator */}
              {senderDetails?.active ? (
                <div className="absolute -right-1 -bottom-1">
                  <span className="relative flex size-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative inline-flex size-3 rounded-full bg-green-600"></span>
                  </span>
                </div>
              ) : senderDetails?.updatedAt ? (
                <div className="absolute text-[7px] max-w-20  bg-white ring-[0.5px] text-black rounded-full -right-1 ring-green-400 -bottom-1">
                  <p className="justify-self-center my-auto truncate text-shadow-2xs">
                    {timeAgo(senderDetails.updatedAt)}
                  </p>
                </div>
              ) : null}
            </div>

            <p className="text-gray-500">{senderDetails?.name || "..."}</p>

            {isLoading ? (
              <ClipLoader
                color="gray"
                loading={true}
                size={20}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            ) : (
              <IoTrash
                className="cursor-pointer text-red-500"
                onClick={() => handleDeleteCon(selectedConversation._id)}
              />
            )}
          </div>

          {/* Body */}
          <div className="w-full flex flex-col h-8/9 justify-end">
            {!userDetailsLoading &&
            selectedConversation?._id &&
            senderDetails?._id ? (
              <>
                {" "}
                <Messages
                  id={selectedConversation._id}
                  participant={senderDetails}
                  unseenCount={unseenCount}
                  isTyping={isTyping}
                />
                <div className="w-full">
                  <SendMessage id={selectedConversation._id} />
                </div>
              </>
            ) : (
              <div className="flex justify-center items-center h-full">
                <ClipLoader color="gray" size={24} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="flex md:w-full text-black h-full items-center justify-center">
          Select a user to talk
        </p>
      )}
    </div>
  );
};

export default ChatBox;
