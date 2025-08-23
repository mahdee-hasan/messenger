import React, { useEffect, useState } from "react";
import { MdGroupAdd } from "react-icons/md";
import { LuHeartHandshake } from "react-icons/lu";
import { BsPersonHeart } from "react-icons/bs";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { IoPersonAdd, IoPersonCircle } from "react-icons/io5";
import { ClipLoader } from "react-spinners";

import doFriendRequest from "../hooks/Friends/doFriendRequest";
import useChatStore from "../stores/chatStore";
import FriendsSkeleton from "../components/friends/FriendSkeleton";
import removeFriend from "../hooks/Friends/removeFriends";
import PageTitle from "@/utilities/PageTitle";
const Friends = ({ user }) => {
  const [friends, setFriends] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [requestedId, setRequestedId] = useState([]);
  const [removed, setRemoved] = useState([]);
  const [isRemoving, setIsRemoving] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const popUpMsg = useChatStore((s) => s.setPopUpMessage);
  useEffect(() => {
    loadFriends();
    loadSuggestion();
  }, [pathname]);
  const handleFriendRequest = async (id) => {
    setRequestedId((prev) => [...prev, id]);
    const data = await doFriendRequest(id);
    popUpMsg(data.message || data.error || "there is a problem");
  };
  const loadFriends = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/friends`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "error finding friends");
      setFriends(data.friends);
    } catch (error) {
      console.log(error.message);
    }
  };

  const loadSuggestion = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/friends-suggestion`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "error finding suggested friends");
      setSuggestedFriends(data);
    } catch (error) {
      console.log(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const navItems = [
    { sr: 1, title: "Friends", to: "/friends", icon: LuHeartHandshake },
    {
      sr: 2,
      title: "Requests",
      to: "/friends/friend-request",
      icon: MdGroupAdd,
    },
    {
      sr: 3,
      title: "Requested",
      to: "/friends/requested",
      icon: BsPersonHeart,
    },
  ];
  const handleRemoveFriend = async (id) => {
    try {
      setIsRemoving(id);
      const feedBack = await removeFriend(id);
      if (feedBack.success) {
        setRemoved((prev) => [...prev, id]);
        popUpMsg(feedBack.message);
      } else {
        throw new Error(feedBack.error || "error removing friend");
      }
    } catch (error) {
      popUpMsg(error.message);
    } finally {
      setIsRemoving("");
    }
  };
  if (isLoading) return <FriendsSkeleton />;
  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <PageTitle title="friends - social_box application" />
      {/* Top Nav */}
      <div className="flex items-center justify-center gap-6 mb-8">
        {navItems.map((item) => (
          <Link
            key={item.sr}
            to={item.to}
            className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium shadow-md transition-all duration-200 ${
              pathname === item.to
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <item.icon className="text-lg" />
            {item.title}
          </Link>
        ))}
      </div>

      {/* Friends List */}
      {pathname === "/friends" && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Your Friends
          </h2>
          <div className="flex flex-col gap-4 ">
            {friends.length > 0 ? (
              friends.map((f) => (
                <div
                  key={f._id}
                  className="bg-white rounded-2xl shadow p-4 flex items-center justify-between hover:shadow-lg transition"
                >
                  <div
                    className="flex items-center gap-4 hover:underline cursor-pointer"
                    onClick={() => navigate(`/user/${f._id}`)}
                  >
                    {f.avatar ? (
                      <img
                        src={f.avatar}
                        alt="friend"
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <IoPersonCircle className="text-[56px] text-gray-400" />
                    )}
                    <p className="font-semibold text-gray-800">{f.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1.5 text-sm rounded-full cursor-pointer
                     bg-indigo-600 text-white hover:bg-indigo-700 transition"
                      onClick={() => navigate(`/user/${f._id}`)}
                    >
                      see profile
                    </button>
                    {removed.includes(f._id) ? (
                      <p
                        className="px-3 py-1.5 text-sm rounded-full
                     bg-indigo-600 text-white hover:bg-indigo-700 transition"
                      >
                        removed
                      </p>
                    ) : (
                      <button
                        className="px-3 py-1.5 text-sm rounded-full cursor-pointer bg-red-100
                     text-red-600 hover:bg-red-200 transition"
                        onClick={() => handleRemoveFriend(f._id)}
                      >
                        {isRemoving === f._id ? (
                          <ClipLoader
                            color="gray"
                            loading={true}
                            size={20}
                            aria-label="Loading Spinner"
                            data-testid="loader"
                          />
                        ) : (
                          " remove"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">
                You don’t have any friends yet.
              </p>
            )}
          </div>
        </div>
      )}
      <Outlet />

      {/* Suggested Friends */}
      {suggestedFriends.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            People You May Know
          </h2>
          <div className="flex flex-col gap-4">
            {suggestedFriends.map((p) => (
              <div
                key={p._id}
                className="bg-white rounded-2xl shadow p-5 flex items-center justify-between hover:shadow-lg transition"
              >
                <div
                  className="flex items-center gap-4 hover:underline cursor-pointer"
                  onClick={() => navigate(`/user/${p._id}`)}
                >
                  {p.avatar ? (
                    <img
                      src={p.avatar}
                      alt="user"
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <IoPersonCircle className="text-[56px] text-gray-400" />
                  )}
                  <p className="font-semibold text-gray-800">{p.name}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex items-center gap-1 px-3 py-1.5 cursor-pointer
                   bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition"
                    onClick={() => handleFriendRequest(p._id)}
                  >
                    {requestedId.includes(p._id) ? (
                      "requested"
                    ) : (
                      <>
                        {" "}
                        <IoPersonAdd /> Add
                      </>
                    )}
                  </button>
                  <button
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 cursor-pointer
                   rounded-full text-sm font-medium hover:bg-gray-200 transition"
                    onClick={() => navigate(`/user/${p._id}`)}
                  >
                    Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Friends;
