//internal imports
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { IoPersonCircle } from "react-icons/io5";
import {
  FaEnvelope,
  FaUserEdit,
  FaHeart,
  FaRegHeart,
  FaComment,
  FaShareAlt,
} from "react-icons/fa";
import { io } from "socket.io-client";
import useChatStore from "../stores/chatStore";
import timeAgo from "../hooks/timeAgo";
import doLike from "../hooks/doLike";
import undoLike from "../hooks/undoLike";
import getPrivacyIcon from "../hooks/getPrivacyIcons";
import Post from "../components/Post";
const socket = io(import.meta.env.VITE_API_URL, {
  withCredentials: true,
});
const User = () => {
  // for post
  const [posts, setPosts] = useState([]);
  const [likedPostIds, setLikedPostIds] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({});
  const [error, setError] = useState(false);

  const navigate = useNavigate();
  const { userId } = useParams();
  const client = JSON.parse(localStorage.getItem("userId"));
  const setMsg = useChatStore((s) => s.setPopUpMessage);
  const setGlobal = useChatStore((s) => s.setIsOpenGlobal);

  useEffect(() => {
    fetchData();
    fetchPost();
    setGlobal(false);
    if (!localStorage.getItem("userId")) {
      location.replace("/login");
    }
    if (client.value === userId) {
      navigate(`/user-info/${userId}`);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!posts || !client.value) return;

    const likedPost = posts.filter((post) => post.likes.includes(client.value));
    const likedIds = likedPost.map((post) => post._id);
    setLikedPostIds(likedIds);
  }, [posts, client.value]);

  const fetchData = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/login/${userId}`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("User not found");
      const data = await res.json();
      setUser(data);
    } catch (err) {
      setMsg(err.message || "Something went wrong");
      setError(err.message || "Something went wrong");
    }
  };
  const fetchPost = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/post/${userId}`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("User not found");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      setMsg(err.message || "Something went wrong");
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen ">
        <ClipLoader color="white" loading={true} size={100} />
      </div>
    );
  }

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white">
      <div className="relative h-56 max-w-3xl mx-auto">
        <img
          src={user?.cover?.[0]?.src}
          onClick={() => {
            navigate(`/image-preview?url=${user?.cover?.[0]?.src}`);
          }}
          alt="cover"
          className="w-full h-full object-cover object-center"
        />

        <div className="absolute bottom-[-4rem] left-16 flex items-center gap-4">
          <div className="relative">
            {user.avatar ? (
              <img
                onClick={() => {
                  navigate(`/image-preview?url=${user.avatar}`);
                }}
                src={user.avatar}
                alt="avatar"
                className="w-32 h-32 rounded-full bg-gray-50 border-4 border-white dark:border-gray-900 shadow-lg object-cover"
              />
            ) : (
              <IoPersonCircle className="text-[132px] bg-gray-300 rounded-full" />
            )}
          </div>
          <div className="mt-10">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-24 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 max-w-xl">
            {user.bio
              ? user.bio
              : "Lorem ipsum dolor sit amet consectetur adipisicing elit. Debitis, quisquam!"}
          </p>
          <div className="flex gap-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2">
              <FaEnvelope /> Message
            </button>
            <button className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 flex items-center gap-2">
              <FaUserEdit /> Edit
            </button>
          </div>
        </div>

        {user.stats && (
          <div className="flex gap-8 text-center border-y dark:border-gray-700 py-4">
            {Object.entries(user.stats).map(([label, value]) => {
              const valueNum =
                typeof value === "number" ? value : value?.length || 0;
              return (
                <div key={label} className="flex items-center space-x-1">
                  <p className="text-lg font-semibold">{valueNum}</p>
                  <p className="text-xs capitalize text-gray-500 dark:text-gray-400">
                    {label}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
          {posts.length > 0 &&
            posts.map((post) => (
              <div
                key={post._id}
                className="bg-white/90 backdrop-blur-md rounded-2xl shadow-md border border-indigo-100 p-4 space-y-4 hover:shadow-xl transition"
              >
                {/* Header */}
                <Post
                  post={post}
                  likedPostIds={likedPostIds}
                  setLikedPostIds={setLikedPostIds}
                  likeCount={post.likes.length}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default User;
