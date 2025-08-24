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
import { io } from "socket.io-client";
const socket = io(import.meta.env.VITE_API_URL, {
  withCredentials: true,
});
const MainNav = ({ data }) => {
  const navigate = useNavigate();
  const msgUnseen = useChatStore((s) => s.unseenMsg);
  const setMsgUnseen = useChatStore((s) => s.setUnseenMsg);
  const notificationUnseen = useChatStore((s) => s.unseenNotification);
  const setNotificationUnseen = useChatStore((s) => s.setUnseenNotification);
  const isAdmin = data?.userData?.role === "admin";
  const userId = data?.userData?._id;
  const navItems = [
    { sr: 1, title: "feed", to: "/", icon: FaNewspaper },
    {
      sr: 2,
      title: "messenger",
      to: "/inbox",
      icon: FaFacebookMessenger,
      ping: msgUnseen,
    },
    { sr: 3, title: "add-post", to: "/add-post", icon: FaPlus },
    { sr: 4, title: "friends", to: "/friends", icon: FaUsers },
    {
      sr: 5,
      title: "notifications",
      to: "/notifications",
      icon: IoNotificationsSharp,
      ping: notificationUnseen,
    },
    ...(isAdmin
      ? [{ sr: 5.5, title: "users", to: "/users", icon: FaUsersCog }]
      : []),
    { sr: 6, title: "user", to: `/user-info/${userId}`, icon: FaUser },
  ];

  const isOpen = useChatStore((s) => s.isOpenGlobal);
  const setMsg = useChatStore((s) => s.setPopUpMessage);

  useEffect(() => {
    getUnreadCounts();
  }, []);
  const getUnreadCounts = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/unread-counts`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok && res.status !== 404) {
        throw new Error(data.error || "error getting unread");
      }
      setMsgUnseen(data.messageCount);
      setNotificationUnseen(data.notificationCount);
    } catch (error) {
      console.log(error.message);
    }
  };

  //useEffect for notification
  useEffect(() => {
    const handleNotification = (notificationObject) => {
      if (notificationObject.author.includes(userId)) {
        setNotificationUnseen(notificationUnseen + 1);
      }
    };

    socket.on("new_notification", handleNotification);

    return () => {
      socket.off("new_notification", handleNotification);
    };
  }, [userId]);
  // useEffect message notification sound
  useEffect(() => {
    const handleMessage = ({ data, updatedCon }) => {
      if (data.receiver.id === userId) {
        setMsgUnseen(msgUnseen + 1);
      }
    };

    socket.on("new_message", handleMessage);
    return () => socket.off("new_message", handleMessage);
  }, [userId]);
  return (
    <nav
      className={`${
        isOpen ? "hidden md:block" : ""
      } bg-gradient-to-r from-emerald-400 to-green-400
       text-white px-1 md:px-6 py-4 shadow-lg sticky max-w-3xl mx-auto top-0 z-50`}
    >
      <div className="max-w-3xl mx-auto flex justify-between items-center">
        <h1
          className="md:text-2xl cursor-pointer font-bold "
          onClick={() => navigate("/")}
        >
          SocialBox
        </h1>
        <div className="flex items-center w-[70%] justify-between gap-3">
          {data.isLoggedIn ? (
            navItems.map((item) => (
              <Link
                key={item.sr}
                title={item.title}
                to={item.to}
                className="flex items-center gap-2 relative text-2xl px-1 py-1 md:px-3 md:py-1.5
               bg-white text-indigo-600 rounded-full shadow hover:bg-indigo-100 transition"
              >
                {item.ping ? (
                  <div className="absolute -top-1 -right-1 text-xs h-4 w-4 rounded-full text-center text-white bg-red-500">
                    {item.ping}
                  </div>
                ) : (
                  ""
                )}
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
