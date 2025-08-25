import useChatStore from "@/stores/chatStore";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { formatDistanceToNow } from "date-fns"; // ✅ for "time ago"
import { io } from "socket.io-client";
import Skeleton from "react-loading-skeleton";
import { IoPersonCircle } from "react-icons/io5";

const socket = io(import.meta.env.VITE_API_URL, {
  withCredentials: true,
});
const Notifications = ({ user }) => {
  const [seenNotifications, setSeenNotifications] = useState([]);
  const [unseenNotifications, setUnseenNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const setPopUpMsg = useChatStore((s) => s.setPopUpMessage);

  const resetUnseenNotification = useChatStore(
    (s) => s.resetUnseenNotification
  );

  const navigate = useNavigate();

  useEffect(() => {}, [user._id]);

  // Socket listener
  useEffect(() => {
    const handleNotification = (notificationObject) => {
      if (notificationObject.author.includes(user._id)) {
        setUnseenNotifications((prev) => [notificationObject, ...prev]);
      }
    };

    socket.on("new_notification", handleNotification);
    return () => {
      socket.off("new_notification", handleNotification);
    };
  }, [user._id]);

  // Initial load
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/notifications`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "error loading notifications");
      }
      setSeenNotifications(data.seen);
      setUnseenNotifications(data.unseen);
    } catch (error) {
      setPopUpMsg(error.message);
    } finally {
      setIsLoading(false);
      resetUnseenNotification();
    }
  };
  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          >
            <Skeleton height={20} width="40%" />
            <Skeleton height={15} width="80%" className="mt-2" />
            <Skeleton height={12} width="30%" className="mt-2" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {unseenNotifications.length > 0 && (
        <>
          {" "}
          <p>unread notifications</p>
          <div className="space-y-1">
            {unseenNotifications.map((n) => (
              <div
                key={n._id}
                onClick={() => navigate(n.link)} // ✅ use link instead of url
                className="p-4 rounded-xl flex flex-wrap justify-around items-center shadow-md border border-gray-200 dark:border-gray-700 
                         bg-gray-100 dark:bg-gray-900 cursor-pointer hover:bg-white dark:hover:bg-gray-800
                         transition duration-200"
              >
                {n.pic ? (
                  <img
                    src={n.pic}
                    alt="notification"
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <IoPersonCircle className="text-[40px]" />
                )}

                <div className="w-4/5">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                    {n.title}
                  </h3>
                  <p className="text-sm text-gray-600 w-full dark:text-gray-400">
                    {n.description}
                  </p>
                </div>
                {/* ✅ Time ago */}
                <p className="text-xs text-gray-400 w-full mt-2">
                  {n.createdAt
                    ? `${formatDistanceToNow(new Date(n.createdAt))} ago`
                    : ""}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {seenNotifications.length > 0 && (
        <>
          <p>seen notifications</p>{" "}
          <div className="space-y-1">
            {seenNotifications.map((n) => (
              <div
                key={n._id}
                onClick={() => navigate(n.link)} // ✅ use link instead of url
                className="p-4 rounded-xl flex flex-wrap justify-around items-center shadow-md border border-gray-200 dark:border-gray-700 
                         bg-white dark:bg-gray-900 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800
                         transition duration-200"
              >
                {n.pic ? (
                  <img
                    src={n.pic}
                    alt="notification"
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <IoPersonCircle className="text-[40px]" />
                )}

                <div className="w-4/5">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                    {n.title}
                  </h3>
                  <p className="text-sm text-gray-600 w-full dark:text-gray-400">
                    {n.description}
                  </p>
                </div>
                {/* ✅ Time ago */}
                <p className="text-xs text-gray-400 w-full mt-2">
                  {n.createdAt
                    ? `${formatDistanceToNow(new Date(n.createdAt))} ago`
                    : ""}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {!seenNotifications.length && !unseenNotifications.length && (
        <p className="text-center text-gray-500">No notifications yet</p>
      )}
    </div>
  );
};

export default Notifications;
