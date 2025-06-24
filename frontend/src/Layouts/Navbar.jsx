import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useLocation } from "react-router-dom";
import { IoLogIn, IoMail, IoPersonCircle } from "react-icons/io5";
import { FaUsersViewfinder } from "react-icons/fa6";
import { toast, ToastContainer } from "react-toastify";

const Navbar = ({ data }) => {
  const [error, setError] = useState(null);
  const username = JSON.parse(localStorage.getItem("username"))?.value;
  const Location = useLocation();
  const pathname = Location.pathname;

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
        className="flex flex-row justify-center p-4 uppercase lg:px-80 px-20
       items-center space-x-2
      bg-sky-400 text-blue-700"
      >
        <ToastContainer />
        {data.isLoggedIn ? (
          <a
            href={`/user-info/${username}`}
            className={`p-2 px-4 ${
              pathname === `/user-info/${username}`
                ? "border-b-3 border-black/50 bg-white/90 text-black"
                : "text-gray-700"
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
                ? "border-b-3 border-black/50 bg-white/90 text-black"
                : "text-gray-700"
            } 
        nav-bar-component`}
          >
            <IoLogIn className="nav-photo" />{" "}
            <span className="hidden md:block">login</span>
          </a>
        )}
        {data.isLoggedIn && (
          <>
            <hr className=" rotate-90 min-w-10 h-1 bg-sky-900 "></hr>
            <a
              href="/inbox"
              className={`p-2 px-4 ${
                pathname === `/inbox`
                  ? "border-b-3 border-black/50 bg-white/90 text-black"
                  : "text-gray-700"
              } 
          nav-bar-component`}
            >
              <IoMail className="nav-photo" />
              <span className="hidden md:block">inbox</span>
            </a>

            {data.userData.role === "admin" && (
              <>
                <hr className=" rotate-90 min-w-10 h-1 bg-sky-900 "></hr>
                <a
                  href="/users"
                  className={`p-2 px-4 ${
                    pathname === `/users`
                      ? " border-b-3 border-black/50 bg-white/90 text-black"
                      : "text-gray-700"
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
