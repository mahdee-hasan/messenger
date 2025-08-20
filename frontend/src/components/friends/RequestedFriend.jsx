import React, { useState, useEffect } from "react";
import { ClipLoader } from "react-spinners";

import RequestFriendsSkeleton from "./RequestFriendsSkeleton";
import useChatStore from "../../stores/chatStore";
import undoFriendRequest from "../../hooks/Friends/undoFriendRequest";
import { useNavigate } from "react-router";

const RequestedFriend = () => {
  const [cancelled, setCancelled] = useState([]);
  const [isCancelling, setIsCancelling] = useState("");
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const popUpMsg = useChatStore((s) => s.setPopUpMessage);
  const navigate = useNavigate();
  useEffect(() => {
    loadFriends();
  }, []);
  const loadFriends = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/requested-friend`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "error finding friend request");
      setFriends(data.friend_requested);
    } catch (error) {
      console.log(error.message);
      popUpMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleUndoRequest = async (id) => {
    try {
      setIsCancelling(id);
      const feedBack = await undoFriendRequest(id);
      if (feedBack.success) {
        setCancelled((prev) => [...prev, id]);
        popUpMsg(feedBack.message);
      } else {
        throw new Error(feedBack.error || "error removing friend");
      }
    } catch (error) {
      popUpMsg(error.message);
    } finally {
      setIsCancelling("");
    }
  };
  if (isLoading) return <RequestFriendsSkeleton />;
  return (
    <div className="mb-12">
      <h2 className="text-2xl capitalize font-semibold text-gray-800 mb-6">
        friend you requested
      </h2>
      <div className="flex flex-col gap-4">
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
                {cancelled.includes(f._id) ? (
                  <p
                    className="px-3 py-1.5 text-sm rounded-full
                     bg-indigo-600 text-white hover:bg-indigo-700 transition"
                  >
                    cancelled
                  </p>
                ) : (
                  <button
                    className="px-3 py-1.5 text-sm rounded-full cursor-pointer bg-red-100
                     text-red-600 hover:bg-red-200 transition"
                    onClick={() => handleUndoRequest(f._id)}
                  >
                    {isCancelling === f._id ? (
                      <ClipLoader
                        color="gray"
                        loading={true}
                        size={20}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                      />
                    ) : (
                      " cancel"
                    )}
                  </button>
                )}
                <button
                  className="px-3 py-1.5 text-sm rounded-full
                 bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer transition"
                  onClick={() => navigate(`/user/${f._id}`)}
                >
                  see profile
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">
            You don’t have any friend request yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default RequestedFriend;
