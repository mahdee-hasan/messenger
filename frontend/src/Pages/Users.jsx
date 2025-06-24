import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IoAddCircleSharp, IoTrash } from "react-icons/io5";
import { ToastContainer, toast } from "react-toastify";
import PageTitle from "../components/PageTitle";
import { MdAdminPanelSettings } from "react-icons/md";
import Example from "../Layouts/Modal";
import { FaCircleUser } from "react-icons/fa6";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [error2, setError2] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef();

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    loadUser();

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);
  const loadUser = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
      credentials: "include",
    });
    if (!res.ok) {
      setError2("something went wrong!");
    }
    const data = await res.json();
    if (Array.isArray(data)) {
      setUsers(data);
    } else {
      setError2(data?.message || "Failed to fetch users");
    }
  };

  const handleModalOpen = (value) => {
    setIsOpen(value);
  };
  const handleDeleteUser = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => toast.success(data.message))
        .catch((err) => {
          throw new Error(err.message);
        });
      setTimeout(() => {
        location.reload();
      }, 1000);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (typeof error2 === "object" && Object.keys(error2).length > 0) {
    return <p>{error2.message}</p>;
  } else if (typeof error2 === "string") {
    return <p>{error2}</p>;
  }
  return (
    <>
      <PageTitle title="users - chat application" />
      <ToastContainer />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            onClick={() => handleModalOpen(false)}
          >
            {" "}
            <div onClick={(e) => e.stopPropagation()}>
              <Example handleModalOpen={handleModalOpen} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div
        className="h-[100vh] w-full md:max-h-[440px] relative overflow-scroll scrollbar-hide
       md:w-[80%] bg-cyan-700 justify-self-center md:rounded-2xl mx-auto md:mt-10"
      >
        <div
          className="flex fixed z-10 w-full md:w-[80%] justify-center space-x-10
         h-24 bg-cyan-600 p-2 items-center md:rounded-t-2xl"
        >
          <p className="text-gray-300 text-3xl">Users</p>
        </div>
        <div className="p-1 mt-24 overflow-y-auto max-h-[450px]">
          {users.map((user) => (
            <div
              key={user._id}
              className="flex h-20 w-full bg-cyan-500 px-12 justify-between items-center border-b-2 border-cyan-600 rounded-b-lg"
            >
              <div className="flex relative max-w-32 items-center justify-baseline space-x-4 md:space-x-14">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    className="w-9 h-9 md:h-12 md:w-12 rounded-full
                    ring ring-offset-0 ring-gray-700 object-cover aspect-square object-center "
                    alt="user"
                  />
                ) : (
                  <FaCircleUser
                    className="text-4xl text-blue-500 md:scale-150 aspect-square md:h-12
                   md:w-12 rounded-full ring md:ring-0 ring-offset-0 ring-gray-700"
                  />
                )}
                <p className="text-gray-700 w-12 font-bold">{user.name}</p>

                {user.role === "admin" && (
                  <MdAdminPanelSettings className="absolute text-cyan-200 text-2xl left-3 -bottom-1 " />
                )}
              </div>{" "}
              <p className="text-sm text-left">{user.email}</p>
              {user.role === "user" ? (
                <IoTrash
                  className="text-[20px] text-red-500 cursor-pointer"
                  onClick={() => {
                    handleDeleteUser(user._id);
                  }}
                />
              ) : (
                <MdAdminPanelSettings
                  className="text-[20px] text-red-500 cursor-pointer"
                  onClick={() => {
                    toast.error("admin is not deletable");
                  }}
                />
              )}
            </div>
          ))}
          <div
            className="h-20 w-full bg-cyan-500 px-12 flex justify-center items-center border-b-2
           border-cyan-600 rounded-b-lg"
          >
            <IoAddCircleSharp
              className="text-5xl cursor-pointer text-gray-600 font-extrabold"
              onClick={() => setIsOpen(true)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Users;
