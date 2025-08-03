import { useEffect } from "react";
import useChatStore from "../stores/chatStore";
import {
  FaUserCircle,
  FaHeart,
  FaShareAlt,
  FaComment,
  FaRegHeart,
} from "react-icons/fa";
import { useState } from "react";
import { ClipLoader } from "react-spinners";
import { io } from "socket.io-client";
//external
import timeAgo from "../hooks/timeAgo";
import getPrivacyIcon from "../hooks/getPrivacyIcons";
import doLike from "../hooks/doLike";
import undoLike from "../hooks/undoLike";

const socket = io(import.meta.env.VITE_API_URL, {
  withCredentials: true,
});

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [likedPostIds, setLikedPostIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const global = useChatStore((s) => s.setIsOpenGlobal);
  const [userId, setUserId] = useState("");
  useEffect(() => {
    setUserId(JSON.parse(localStorage.getItem("userId"))?.value);
    loadPost();
  }, []);

  useEffect(() => {
    const handleLike = (data) => {
      const { postId, userId } = data;

      setLikedPostIds((prev) => [...prev, postId]);

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, likes: [...post.likes, userId] }
            : post
        )
      );
    };

    socket.on("like", handleLike);
    return () => {
      socket.off("like", handleLike);
    };
  }, []);

  useEffect(() => {
    const handleUndoLike = ({ postId, userId }) => {
      setLikedPostIds((prev) => prev.filter((id) => id !== postId));
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: post.likes.filter((id) => id !== userId),
              }
            : post
        )
      );
    };

    socket.on("undo-like", handleUndoLike);
    return () => {
      socket.off("undo-like", handleUndoLike);
    };
  }, []);

  useEffect(() => {
    if (!posts || !userId) return;

    const likedPost = posts.filter((post) => post.likes.includes(userId));
    const likedIds = likedPost.map((post) => post._id);
    setLikedPostIds(likedIds);
  }, [posts, userId]);

  const loadPost = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/feeds`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        throw new error("error loading data");
      }
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.log(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  const doLikeHandler = async (id) => {
    await doLike(id);
  };
  const undoLikeHandler = async (id) => {
    await undoLike(id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ClipLoader
          color="gray"
          loading={true}
          size={100}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      {/* Feed */}
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
        {posts.length > 0 &&
          posts.map((post) => (
            <div
              key={post._id}
              className="bg-white/90 backdrop-blur-md rounded-2xl shadow-md border border-indigo-100 p-4 space-y-4 hover:shadow-xl transition"
            >
              {/* Header */}
              <div
                className="flex items-center gap-3 cursor-pointer hover:text-blue-600"
                onClick={() => location.replace(`/user/${post.author.id}`)}
              >
                {post.author?.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt="user"
                    className="h-[30px] w-[30px] rounded-full ring-1"
                  />
                ) : (
                  <FaUserCircle className="text-3xl text-indigo-400" />
                )}
                <div>
                  <h2 className="font-bold text-indigo-700 hover:text-blue-600 hover:underline">
                    {post.author?.name}
                  </h2>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    {timeAgo(post.createdAt)} • {getPrivacyIcon(post.privacy)}
                  </p>
                </div>
              </div>

              {/* Text */}
              <p className="text-gray-700 text-base">{post.text}</p>

              {/* Image */}
              {post.images?.length > 0 &&
                post.images.map((img) => (
                  <div
                    className="rounded-xl overflow-hidden border border-indigo-100"
                    key={img.public_id}
                  >
                    <img
                      onClick={() => {
                        location.replace(`/image-preview?url=${img.url}`);
                      }}
                      src={img.url}
                      alt="Post"
                      className="w-full max-h-96 object-cover"
                    />
                  </div>
                ))}

              {/* Footer Buttons */}
              <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center cursor-pointer gap-1 font-medium">
                    {likedPostIds.includes(post._id) ? (
                      <FaHeart
                        className="text-red-500"
                        onClick={() => undoLikeHandler(post._id)}
                      />
                    ) : (
                      <FaRegHeart
                        className="text-gray-500"
                        onClick={() => doLikeHandler(post._id)}
                      />
                    )}
                    {post?.likes?.length || 0} Likes
                  </div>

                  <button
                    className="flex hover:underline items-center cursor-pointer gap-1 hover:text-indigo-600 transition"
                    onClick={() =>
                      location.replace(`/post-details/${post._id}`)
                    }
                  >
                    <FaComment />
                    View Comments
                  </button>
                </div>

                <button className="flex items-center gap-1 hover:text-indigo-600 transition">
                  <FaShareAlt />
                  Share
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
