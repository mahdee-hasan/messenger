// components/SearchModal.jsx
import React, { useEffect, useRef, useState } from "react";
import { IoPencilOutline, IoPersonCircle } from "react-icons/io5";
import Modal from "react-modal";
Modal.setAppElement("#root"); // For accessibility
import { FaArrowLeft } from "react-icons/fa";
import useChatStore from "../stores/chatStore";

const SearchModal = ({ isOpen, setIsOpen, onClose, openFunc }) => {
  const [users, setUsers] = useState([]);
  const timeoutRef = useRef(null);
  const setMsg = useChatStore((s) => s.setPopUpMessage);

  const handleSearch = (e) => {
    const value = e.target.value;

    // Clear previous timeout
    clearTimeout(timeoutRef.current);

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      (async () => {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/inbox/searchUser`,
            {
              method: "POST",
              body: JSON.stringify({ user: value }),
              headers: {
                "Content-type": "application/json",
              },
              credentials: "include",
            }
          );
          if (!res.ok) {
            throw new Error("Failed to fetch the user data");
          }

          const usersData = await res.json();
          setUsers(usersData);
        } catch (error) {
          console.error(error.message || "Something went wrong");
          setMsg(error.message || "Something went wrong");
        }
      })();
    }, 500);
  };
  const handleChatOpen = async (id, name, avatar) => {
    try {
      const participant = { id, name, avatar };
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/inbox/conversation`,
        {
          method: "POST",
          body: JSON.stringify({
            participant_2: participant,
          }),
          headers: {
            "content-type": "application/json",
          },
          credentials: "include",
        }
      );
      const feedback = await res.json();
      if (feedback.message === "chat already exist") {
        setIsOpen(false);
        openFunc(id);
        return;
      }
      setTimeout(() => {
        location.reload();
      }, 1000);
    } catch (error) {
      alert(error.message);
    }
  };
  // Clear timeout when component unmounts
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="w-full h-[100vh] relative mt-28 p-5 rounded-xl mx-auto shadow-lg outline-none"
      overlayClassName="fixed inset-0 bg-gray-100 flex justify-center items-center"
    >
      <FaArrowLeft
        className="fixed top-20 ring rounded-full bg-gray-300/50 left-1 text-xl text-gray-700 "
        onClick={() => {
          setIsOpen(false);
        }}
      />
      <input
        type="text"
        placeholder="Search..."
        className="w-full p-1 px-3 border border-gray-100 rounded-2xl bg-gray-200 focus:bg-white mb-4 outline-none"
        onChange={handleSearch}
        autoFocus
      />

      <div className="absolute top-20 w-full">
        {users.length > 0 &&
          users.map((user) => (
            <div
              key={user._id}
              className="flex hover:bg-gray-50 cursor-pointer
              min-h-8  rounded-sm shadow-2xl
             w-[90%] p-3 py-2 justify-baseline items-center space-x-5"
              onClick={() => {
                handleChatOpen(user._id, user.name, user.avatar);
              }}
            >
              {user.avatar ? (
                <img
                  className="h-6 w-6 aspect-square object-cover rounded-full"
                  src={user.avatar}
                  alt="user"
                />
              ) : (
                <IoPersonCircle className="text-[24px]" />
              )}
              <p className=" text-gray-600 font-semibold">{user.name}</p>
              <p className="text-[10px] text-gray-500">{user.role}</p>
            </div>
          ))}
      </div>
    </Modal>
  );
};

export default SearchModal;
