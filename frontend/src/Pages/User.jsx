// User.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { IoPersonAdd, IoPersonCircle, IoPersonRemove } from "react-icons/io5";
import { FaEnvelope } from "react-icons/fa";
import useChatStore from "../stores/chatStore";
import Post from "../components/post/Post";
import doFriendRequest from "../hooks/Friends/doFriendRequest";
import removeFriend from "../hooks/Friends/removeFriends";
import acceptFriendRequest from "../hooks/Friends/acceptFriendRequest";
import undoFriendRequest from "../hooks/Friends/undoFriendRequest";

const User = () => {
  const [posts, setPosts] = useState([]);
  const [likedPostIds, setLikedPostIds] = useState([]);
  const [isWorking, setIsWorking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({});
  const [error, setError] = useState(false);
  const [relation, setRelation] = useState({
    relation: "add friend",
    func: () => {},
    icon: IoPersonAdd,
  });

  const navigate = useNavigate();
  const { userId } = useParams();
  const client = JSON.parse(localStorage.getItem("userId"));
  const setMsg = useChatStore((s) => s.setPopUpMessage);
  const setGlobal = useChatStore((s) => s.setIsOpenGlobal);

  useEffect(() => {
    if (!localStorage.getItem("userId")) {
      location.replace("/login");
      return;
    }
    if (client?.value === userId) {
      navigate(`/user-info/${userId}`);
      return;
    }
    fetchData();
    fetchPost();
    setGlobal(false);
  }, []);

  useEffect(() => {
    if (!posts || !client?.value) return;
    const likedIds = posts
      .filter((post) => post.likes.includes(client.value))
      .map((post) => post._id);
    setLikedPostIds(likedIds);
  }, [posts, client?.value]);

  const fetchPost = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/post/${userId}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("User not found");
      setPosts(await res.json());
    } catch (err) {
      setMsg(err.message || "Something went wrong");
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const createConversation = async (id, name, avatar) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/inbox/conversation`,
        {
          method: "POST",
          body: JSON.stringify({ participant_2: { id, name, avatar } }),
          headers: { "content-type": "application/json" },
          credentials: "include",
        }
      );
      const feedback = await res.json();
      if (!res.ok && !feedback.match)
        throw new Error(feedback.message || "error creating conversation");
      navigate(`/inbox?id=${feedback.id}`);
    } catch (error) {
      alert(error.message);
    }
  };

  // --- Friend handlers ---
  const handleFriendRequest = async (id) => {
    try {
      setIsWorking(true);
      const data = await doFriendRequest(id);
      if (data.success) {
        setRelation({
          relation: "remove request",
          func: handleUndoRequest,
          icon: IoPersonRemove,
        });
        setMsg(data.message);
      } else throw new Error(data.error);
    } catch (error) {
      setMsg(error.message);
    } finally {
      setIsWorking(false);
    }
  };

  const handleRemoveFriend = async (id) => {
    try {
      setIsWorking(true);
      const data = await removeFriend(id);
      if (data.success) {
        setRelation({
          relation: "add friend",
          func: handleFriendRequest,
          icon: IoPersonAdd,
        });
        setMsg(data.message);
      } else throw new Error(data.error);
    } catch (error) {
      setMsg(error.message);
    } finally {
      setIsWorking(false);
    }
  };

  const handleAcceptFriend = async (id) => {
    try {
      setIsWorking(true);
      const data = await acceptFriendRequest(id);
      if (data.success) {
        setRelation({
          relation: "remove friend",
          func: handleRemoveFriend,
          icon: IoPersonRemove,
        });
        setMsg(data.message);
      } else throw new Error(data.error);
    } catch (error) {
      setMsg(error.message);
    } finally {
      setIsWorking(false);
    }
  };

  const handleUndoRequest = async (id) => {
    try {
      setIsWorking(true);
      const data = await undoFriendRequest(id);
      if (data.success) {
        setRelation({
          relation: "add friend",
          func: handleFriendRequest,
          icon: IoPersonAdd,
        });
        setMsg(data.message);
      } else throw new Error(data.error);
    } catch (error) {
      setMsg(error.message);
    } finally {
      setIsWorking(false);
    }
  };

  const fetchData = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/login/${userId}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("User not found");
      const data = await res.json();
      setUser(data);

      if (data.friends?.includes(client?.value)) {
        setRelation({
          relation: "remove friend",
          func: handleRemoveFriend,
          icon: IoPersonRemove,
        });
      } else if (data.friend_request?.includes(client?.value)) {
        setRelation({
          relation: "remove request",
          func: handleUndoRequest,
          icon: IoPersonRemove,
        });
      } else if (data.friend_requested?.includes(client?.value)) {
        setRelation({
          relation: "accept friend",
          func: handleAcceptFriend,
          icon: IoPersonAdd,
        });
      } else {
        setRelation({
          relation: "add friend",
          func: handleFriendRequest,
          icon: IoPersonAdd,
        });
      }
    } catch (err) {
      setMsg(err.message || "Something went wrong");
      setError(err.message || "Something went wrong");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ClipLoader color="white" loading size={100} />
      </div>
    );
  }

  if (error) return <div className="text-center py-10">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white">
      {/* Cover */}
      <div className="relative h-56 max-w-3xl mx-auto">
        {user?.cover?.[0]?.src && (
          <img
            src={user.cover[0].src}
            onClick={() => navigate(`/image-preview?url=${user.cover[0].src}`)}
            alt="cover"
            className="w-full h-full object-cover"
          />
        )}

        <div className="absolute bottom-[-4rem] left-16 flex items-center gap-4">
          <div className="relative">
            {user?.avatar ? (
              <img
                onClick={() => navigate(`/image-preview?url=${user.avatar}`)}
                src={user.avatar}
                alt="avatar"
                className="w-32 h-32 rounded-full bg-gray-50 border-4 border-white dark:border-gray-900 shadow-lg object-cover"
              />
            ) : (
              <IoPersonCircle className="text-[132px] bg-gray-300 rounded-full" />
            )}
          </div>
          <div className="mt-10">
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="max-w-3xl mx-auto px-4 pt-24 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 max-w-xl">
            {user?.bio || "no bio yet"}
          </p>

          <div className="flex gap-3">
            <button
              onClick={() =>
                createConversation(user._id, user.name, user.avatar)
              }
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"
            >
              <FaEnvelope /> Message
            </button>

            <button
              disabled={isWorking}
              onClick={() => relation.func(user._id)}
              className="bg-gray-200 dark:bg-gray-700 text-black cursor-pointer
              dark:text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:opacity-90"
            >
              {relation.icon && <relation.icon />}
              {isWorking ? (
                <ClipLoader color="gray" loading size={20} />
              ) : (
                relation.relation
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-8 text-center border-y dark:border-gray-700 py-4">
          {[
            { label: "post", value: posts?.length || 0 },
            { label: "friends", value: user.friends?.length || 0 },
            {
              label: "following",
              value:
                (user.friends?.length || 0) +
                (user.friend_requested?.length || 0),
            },
          ].map((item, i) => (
            <div key={i} className="flex items-center space-x-1">
              <p className="text-lg font-semibold">{item.value}</p>
              <p className="text-xs capitalize text-gray-500 dark:text-gray-400">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {/* Posts */}
        <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
          {posts?.length > 0 &&
            posts.map((post) => (
              <div
                key={post._id}
                className="bg-white/90 dark:bg-gray-800 rounded-2xl shadow-md border border-indigo-100 p-4 hover:shadow-xl transition"
              >
                <Post
                  post={post}
                  likedPostIds={likedPostIds}
                  setLikedPostIds={setLikedPostIds}
                  likeCount={post.likes?.length || 0}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default User;
