import { useEffect } from "react";
import useChatStore from "../stores/chatStore";

import { useState } from "react";
import { ClipLoader } from "react-spinners";

//external
import Post from "../components/post/Post";

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
    if (!posts || !userId) return;

    const likedPost = posts.filter((post) => post.likes.includes(userId));
    const likedIds = likedPost.map((post) => post._id);
    setLikedPostIds(likedIds);
  }, [posts]);

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
  );
}
