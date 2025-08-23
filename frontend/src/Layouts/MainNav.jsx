import React, { useEffect, useState } from "react";

import {
  FaFacebookMessenger,
  FaNewspaper,
  FaPlus,
  FaUser,
  FaUsers,
  FaUsersCog,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import useChatStore from "../stores/chatStore";
import { IoNotificationsSharp } from "react-icons/io5";
import { MdLogin } from "react-icons/md";

const MainNav = ({ data }) => {
  const navigate = useNavigate();
  const isAdmin = data?.userData?.role === "admin";
  const userId = data?.userData?._id;
  const navItems = [
    { sr: 1, title: "feed", to: "/", icon: FaNewspaper },
    { sr: 2, title: "messenger", to: "/inbox", icon: FaFacebookMessenger },
    { sr: 3, title: "add-post", to: "/add-post", icon: FaPlus },
    { sr: 4, title: "friends", to: "/friends", icon: FaUsers },
    {
      sr: 5,
      title: "notifications",
      to: "/notifications",
      icon: IoNotificationsSharp,
    },
    ...(isAdmin
      ? [{ sr: 5.5, title: "users", to: "/users", icon: FaUsersCog }]
      : []),
    { sr: 6, title: "user", to: `/user-info/${userId}`, icon: FaUser },
  ];

  const isOpen = useChatStore((s) => s.isOpenGlobal);

  return (
    <nav
      className={`${
        isOpen ? "hidden md:block" : ""
      } bg-gradient-to-r from-emerald-400 to-green-400
       text-white px-1 md:px-6 py-4 shadow-lg sticky max-w-3xl mx-auto top-0 z-50`}
    >
      <div className="max-w-3xl mx-auto flex justify-between items-center">
        <h1
          className=" text-sm  md:text-2xl cursor-pointer font-bold "
          onClick={() => navigate("/")}
        >
          SocialBox
        </h1>
        <div className="flex items-center gap-3">
          {data.isLoggedIn ? (
            navItems.map((item) => (
              <Link
                key={item.sr}
                title={item.title}
                to={item.to}
                className="flex items-center gap-2 px-1 py-1 md:px-3 md:py-1.5
               bg-white text-indigo-600 rounded-full shadow hover:bg-indigo-100 transition"
              >
                <item.icon />
              </Link>
            ))
          ) : (
            <Link
              title="login"
              to="/login"
              className="flex items-center gap-2 px-3 py-1.5
               bg-white text-indigo-600 rounded-full shadow hover:bg-indigo-100 transition"
            >
              <MdLogin />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default MainNav;
