import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useLocation } from "react-router-dom";
import { IoLogIn, IoMail, IoPersonCircle } from "react-icons/io5";
import { FaUsersViewfinder } from "react-icons/fa6";
import useChatStore from "../stores/chatStore"; // or correct path

const Navbar = ({ data }) => {
  const [error, setError] = useState(null);
  const username = JSON.parse(localStorage.getItem("userId"))?.value;
  const Location = useLocation();
  const pathname = Location.pathname;

  const isOpen = useChatStore((s) => s.isOpenGlobal);

  const fetchData = async () => {
    try {
      if (!username) {
        fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
          method: "DELETE",
          credentials: "include",
        })
          .then((res) => res.json())
          .catch((err) => {
            throw new Error(err.message || "Logout failed");
          });
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  };

  useEffect(() => {
    fetchData();
  }, [username]);

  return (
    <>
      <div
        className={`${
          isOpen ? "hidden" : "flex fixed"
        }  flex-row z-10 bg-white dark:bg-gray-400 dark:text-white px-6 
          bottom-0 justify-between w-full py-4 uppercase lg:px-80
       items-center`}
      >
        {data.isLoggedIn ? (
          <a
            href={`/user-info/${username}`}
            className={`p-2 px-4 ${
              pathname === `/user-info/${username}`
                ? "text-blue-600"
                : "text-gray-600  dark:text-white"
            } 
      nav-bar-component`}
          >
            <IoPersonCircle className="nav-photo" />{" "}
            <span className="hidden md:block">user-info</span>
          </a>
        ) : (
          <a
            href="/login"
            className={`p-2 px-4 ${
              pathname === `/login`
                ? "text-blue-600"
                : "text-gray-600 dark:text-white"
            } 
        nav-bar-component`}
          >
            <IoLogIn className="nav-photo" />{" "}
            <span className="hidden md:block">login</span>
          </a>
        )}
        {data.isLoggedIn && (
          <>
            <a
              href="/inbox"
              className={`p-2 px-4 ${
                pathname === `/inbox`
                  ? "text-blue-600"
                  : "text-gray-600 dark:text-white"
              } 
          nav-bar-component`}
            >
              <IoMail className="nav-photo" />
              <span className="hidden md:block">inbox</span>
            </a>

            {data.userData.role === "admin" && (
              <>
                <a
                  href="/users"
                  className={`p-2 px-4 ${
                    pathname === `/users`
                      ? "text-blue-600"
                      : "text-gray-600  dark:text-white"
                  } 
         nav-bar-component`}
                >
                  <FaUsersViewfinder className="nav-photo" />
                  <span className="hidden md:block">users</span>
                </a>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Navbar;
