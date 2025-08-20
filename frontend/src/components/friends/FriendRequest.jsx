import React, { useState, useEffect } from "react";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

import RequestFriendsSkeleton from "./RequestFriendsSkeleton";
import acceptFriendRequest from "../../hooks/Friends/acceptFriendRequest";
import useChatStore from "../../stores/chatStore";
import rejectFriend from "../../hooks/Friends/rejectFriend";
const FriendRequest = () => {
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState("");
  const [isRejecting, setIsRejecting] = useState("");
  const [accepted, setAccepted] = useState([]);
  const [rejected, setRejected] = useState([]);

  const navigate = useNavigate();
  const popUpMessage = useChatStore((s) => s.setPopUpMessage);
  useEffect(() => {
    loadFriends();
  }, []);
  const loadFriends = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/friend-request`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "error finding friend request");
      setFriends(data.friend_request);
    } catch (error) {
      console.log(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleAcceptFriend = async (id) => {
    try {
      setIsAccepting(id);
      const feedBack = await acceptFriendRequest(id);
      if (feedBack.success) {
        setAccepted((prev) => [...prev, id]);
        popUpMessage(feedBack.message);
      } else {
        popUpMessage(feedBack.error);
      }
    } catch (error) {
      popUpMessage(error.message);
    } finally {
      setIsAccepting("");
    }
  };
  const handleReject = async (id) => {
    try {
      setIsRejecting(id);
      const feedBack = await rejectFriend(id);
      if (feedBack.success) {
        setRejected((prev) => [...prev, id]);
        popUpMessage(feedBack.message);
      } else {
        popUpMessage(feedBack.error);
      }
    } catch (error) {
      popUpMessage(error.message);
    } finally {
      setIsRejecting("");
    }
  };
  if (isLoading) return <RequestFriendsSkeleton />;
  return (
    <div className="mb-12">
      <h2 className="text-2xl capitalize font-semibold text-gray-800 mb-6">
        friend requests
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
                {accepted.includes(f._id) ? (
                  <p
                    className="px-3 py-1.5 text-sm rounded-full
                 bg-white text-indigo-600 ring-1 ring-offset-0 transition"
                  >
                    accepted
                  </p>
                ) : rejected.includes(f._id) ? (
                  <p
                    className="px-3 py-1.5 text-sm rounded-full
                 bg-white text-indigo-600 ring-1 ring-offset-0 transition"
                  >
                    rejected
                  </p>
                ) : (
                  <>
                    <button
                      className="px-3 cursor-pointer py-1.5 text-sm rounded-full
                 bg-indigo-600 text-white hover:bg-indigo-700 transition"
                      onClick={() => handleAcceptFriend(f._id)}
                    >
                      {isAccepting === f._id ? (
                        <ClipLoader
                          color="gray"
                          loading={true}
                          size={20}
                          aria-label="Loading Spinner"
                          data-testid="loader"
                        />
                      ) : (
                        " accept"
                      )}
                    </button>

                    <button
                      className="px-3 py-1.5 text-sm rounded-full
                 bg-red-100 text-red-600 hover:bg-red-200 transition cursor-pointer"
                      onClick={() => handleReject(f._id)}
                    >
                      {isRejecting === f._id ? (
                        <ClipLoader
                          color="gray"
                          loading={true}
                          size={20}
                          aria-label="Loading Spinner"
                          data-testid="loader"
                        />
                      ) : (
                        "reject"
                      )}
                    </button>
                  </>
                )}
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

export default FriendRequest;
