//internal import
import React, { useEffect, useState } from "react";
import { FaUserCircle, FaComment, FaShareAlt } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import "react-loading-skeleton/dist/skeleton.css";
import Skeleton from "react-loading-skeleton";
import { useParams } from "react-router";

//external import
import getPrivacyIcons from "../hooks/getPrivacyIcons";
import timeAgo from "../hooks/timeAgo";
const PostDetails = () => {
  const [liked, setLiked] = useState(false);
  const [postLoading, setPostLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(true);
  const [isCommenting, setIsCommenting] = useState(false);
  const [post, setPost] = useState({});
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  const { postId } = useParams();

  useEffect(() => {
    loadPost();
    loadComments();
  }, [postId]);

  const loadPost = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/feeds/post/${postId}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "error finding post");
      }
      setPost(data);
    } catch (error) {
      console.log(error.message);
    } finally {
      setPostLoading(false);
    }
  };
  const loadComments = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/feeds/comments/${postId}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "error finding comment");
      }
      setComments(data);
    } catch (error) {
      console.log(error.message);
    } finally {
      setCommentLoading(false);
    }
  };
  const handleAddComment = async (e) => {
    setIsCommenting(true);
    try {
      e.preventDefault();
      if (!commentText.trim()) return;

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/feeds/comments/${postId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ text: commentText.trim() }),
        }
      );

      const feedback = await res.json();
      if (!res.ok) {
        throw new Error(feedback.error || "error commenting");
      }
      setComments(feedback);
    } catch (error) {
      console.log(error.message);
    } finally {
      setCommentText("");
      setIsCommenting(false);
    }
  };
  if (postLoading) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div
          className="bg-white dark:bg-gray-800 space-y-2  rounded-xl p-5 shadow-sm
         border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start gap-4">
            <Skeleton circle width={35} height={35} />
            <div className="flex flex-col max-h-16 max-w-50">
              <Skeleton height={15} width={50} />
              <Skeleton height={15} width={70} />
            </div>{" "}
          </div>{" "}
          <div className="flex flex-col space-y-2  mb-3">
            <Skeleton height={20} width="100%" />
            <Skeleton height={20} width="100%" />
          </div>
          <Skeleton height={350} width="100%" />
          <Skeleton height={15} width="20%" />
        </div>
        <div className="my-6 space-y-6">
          {/* Comment Form Skeleton */}
          <div>
            <Skeleton height={80} className="rounded-md" />
            <Skeleton width={100} height={35} className="mt-3 rounded-md" />
          </div>

          {/* Comment List Skeleton */}
          <div className="space-y-4">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg"
              >
                <Skeleton circle width={24} height={24} />
                <div className="w-full space-y-2">
                  <div className="flex justify-between items-center">
                    <Skeleton width={100} height={15} />
                    <Skeleton width={60} height={12} />
                  </div>
                  <Skeleton count={2} height={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        {post && (
          <div className="flex items-start gap-4">
            {post.author?.avatar ? (
              <img
                src={post.author?.avatar}
                alt="user"
                className="h-[30px] w-[30px] rounded-full ring-1"
              />
            ) : (
              <FaUserCircle className="text-3xl text-indigo-400" />
            )}
            <div className="flex-1">
              <h2 className="font-bold text-indigo-700 hover:text-blue-600 hover:underline">
                {post.author?.name}
              </h2>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                {timeAgo(post?.createdAt)} • {getPrivacyIcons(post.privacy)}
              </p>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                {post.text}
              </p>
              {post.images &&
                post.images.map((image, index) => (
                  <img
                    key={index}
                    className="w-full max-h-96 object-cover mt-2 rounded"
                    src={image.url}
                    alt="posts attachment"
                  />
                ))}

              <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                <div className="flex items-center gap-4">
                  {comments ? (
                    <div className="flex items-center gap-1 hover:text-indigo-600 transition cursor-pointer">
                      <FaComment />
                      {comments.length} Comments
                    </div>
                  ) : (
                    ""
                  )}
                </div>

                <button className="flex items-center gap-1 hover:text-indigo-600 transition">
                  <FaShareAlt />
                  Share
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comment Input */}
      <form onSubmit={handleAddComment} className="my-6">
        <textarea
          className="w-full border border-gray-300 dark:border-gray-600
           bg-white dark:bg-gray-900 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-400"
          rows="3"
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button
          type="submit"
          className="mt-2 px-4 min-w-20 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isCommenting ? (
            <ClipLoader
              color="white"
              loading={true}
              size={25}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          ) : (
            " Post Comment"
          )}{" "}
        </button>
      </form>

      {/* Comment List */}
      {comments.length ? (
        <div className="space-y-4">
          {comments.map((c) => (
            <div
              key={c._id}
              className="flex items-start gap-3 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg"
            >
              {c.author.avatar ? (
                <img
                  src={c.author.avatar}
                  alt="user"
                  className="h-6 w-6 object-cover rounded-full"
                />
              ) : (
                <FaUserCircle className="text-2xl text-gray-600 dark:text-white mt-1" />
              )}
              <div className="w-full">
                <div className="flex w-full items-center justify-between">
                  {" "}
                  <p
                    className="font-bold text-blue-500 cursor-pointer hover:underline"
                    onClick={() => location.replace(`/user/${c.author.id}`)}
                  >
                    {c.author.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {timeAgo(c.createdAt)}
                  </p>
                </div>

                <p className="mt-1">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mx-auto max-w-50 ">no comments for this post</p>
      )}
    </div>
  );
};

export default PostDetails;
