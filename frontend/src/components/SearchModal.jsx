// components/SearchModal.jsx
import React, { useEffect, useRef, useState } from "react";
import { IoPencilOutline, IoPersonCircle } from "react-icons/io5";
import Modal from "react-modal";
import { toast, ToastContainer } from "react-toastify";
Modal.setAppElement("#root"); // For accessibility

const SearchModal = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState([]);
  const timeoutRef = useRef(null);

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
          toast.error(error.message || "Something went wrong");
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
            participant: participant,
          }),
          headers: {
            "content-type": "application/json",
          },
          credentials: "include",
        }
      );
      const feedback = await res.json();
      toast(feedback.message);
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
      className="w-[400px] relative p-5 bg-cyan-700 rounded-xl mx-auto mb-20 shadow-lg outline-none"
      overlayClassName="fixed inset-0 bg-black/20 flex justify-center items-center"
    >
      <ToastContainer />
      <h2 className="text-xl font-bold mb-4">Search User</h2>
      <input
        type="text"
        placeholder="Search..."
        className="w-full p-2 border rounded focus:bg-gray-300 mb-4 outline-none"
        onChange={handleSearch}
      />
      <div className="absolute top-28 w-full">
        {users.length > 0 &&
          users.map((user) => (
            <div
              key={user._id}
              className="flex hover:bg-cyan-400 cursor-pointer
              min-h-14 bg-cyan-500 rounded-sm ring ring-cyan-600
             w-[90%] p-3 py-2 justify-baseline items-center space-x-5"
              onClick={() => {
                handleChatOpen(user._id, user.name, user.avatar);
              }}
            >
              {user.avatar ? (
                <img
                  className="h-10 w-10 aspect-square object-cover rounded-full"
                  src={user.avatar}
                  alt="user"
                />
              ) : (
                <IoPersonCircle className="text-[40px]" />
              )}
              <p className="text-xl text-gray-600 font-semibold">{user.name}</p>
              <p className="text-[10px] text-gray-500">{user.role}</p>
            </div>
          ))}
      </div>
    </Modal>
  );
};

export default SearchModal;
