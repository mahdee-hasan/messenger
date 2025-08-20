//internal import
import React, { useEffect, useState } from "react";
import {
  FaUserCircle,
  FaComment,
  FaShareAlt,
  FaRegHeart,
  FaTrash,
  FaEdit,
  FaHeart,
} from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import "react-loading-skeleton/dist/skeleton.css";
import Skeleton from "react-loading-skeleton";
import { useNavigate, useParams } from "react-router";
import { RxCrossCircled } from "react-icons/rx";
import { IoSend } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";
//external import
import getPrivacyIcons from "../hooks/post/getPrivacyIcons";
import timeAgo from "../hooks/timeAgo";
import useChatStore from "../stores/chatStore";
import { FaPerson } from "react-icons/fa6";
import undoLike from "../hooks/post/undoLike";
import doLike from "../hooks/post/doLike";
import undoCommentLike from "../hooks/post/undoCommentLike";
import doCommentLike from "../hooks/post/commentLike";
const PostDetails = ({ data }) => {
  const [postLoading, setPostLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(true);
  const [isCommenting, setIsCommenting] = useState(false);
  const [post, setPost] = useState({});
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [menuOn, setMenuOn] = useState("");
  const [editingComment, setEditingComment] = useState("");
  const [editingCommentText, setEditingCommentText] = useState("");
  const [updatingComment, setUpdatingComment] = useState("");
  const [deletingComment, setDeletingComment] = useState("");
  const [replyingComment, setReplyingComment] = useState("");
  const [replyingCommentText, setReplyingCommentText] = useState("");
  const [isReplying, setIsReplying] = useState("");
  const [showReplies, setShowReplies] = useState("");
  // local state per main comment
  const { postId } = useParams();
  const popUpMsg = useChatStore((s) => s.setPopUpMessage);
  const navigate = useNavigate();
  useEffect(() => {
    loadPost();
    loadComments();
  }, [postId]);
  useEffect(() => {
    setEditingCommentText(
      comments?.find((c) => c._id === editingComment)?.text || ""
    );
  }, [editingComment]);

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
      popUpMsg(error.message);
    } finally {
      setCommentText("");
      setIsCommenting(false);
    }
  };
  const handleDeleteComment = async (id) => {
    setDeletingComment(id);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/feeds/comment/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "error updating comment");
      }
      setComments((prev) => prev.filter((p) => p._id !== id));

      popUpMsg(data.message);
    } catch (error) {
      popUpMsg(error.message);
    } finally {
      setDeletingComment("");
      setEditingComment("");
    }
  };
  const handleUpdateComment = async (id) => {
    setUpdatingComment(id);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/feeds/update-comment/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: editingCommentText }),
          credentials: "include",
        }
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "error updating comment");
      }
      popUpMsg("updated successfully");
      setComments(data);
    } catch (error) {
      popUpMsg(error.message);
    } finally {
      setEditingComment("");
      setUpdatingComment("");
      setMenuOn("");
    }
  };
  const handleReplyComment = async (id) => {
    setIsReplying(id);
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/feeds/reply-comment/${id}?postId=${postId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: replyingCommentText }),
          credentials: "include",
        }
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "error updating comment");
      }
      popUpMsg("replied successfully");
      setComments(data);
    } catch (error) {
      popUpMsg(error.message);
    } finally {
      setReplyingCommentText("");
      setReplyingComment("");
      setShowReplies(id);
    }
  };
  const handleUndoLike = async (id) => {
    const feedback = await undoLike(id);
    if (feedback.success) {
      setPost((prev) => ({
        ...prev,
        likes: prev.likes.filter((id) => id !== data._id), // remove user ID
      }));
    }
  };
  const handleLike = async (id) => {
    const feedback = await doLike(id);
    if (feedback.success) {
      setPost((prev) => ({
        ...prev,
        likes: [...prev.likes, data._id], // add user ID
      }));
    } else {
    }
  };

  const handleCommentLikeClick = async (id) => {
    const feedback = await doCommentLike(id);
    if (feedback.success) {
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === id
            ? { ...comment, likes: [...comment.likes, data._id] }
            : comment
        )
      );
    }
  };

  const handleCommentUnlikeClick = async (id) => {
    const feedback = await undoCommentLike(id);
    if (feedback.success) {
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === id
            ? {
                ...comment,
                likes: comment.likes.filter((uid) => uid !== data._id),
              }
            : comment
        )
      );
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
                <div className="flex justify-center items-center space-x-2 cursor-pointer">
                  {post.likes && post.likes.includes(data._id) ? (
                    <FaHeart
                      className="text-red-500"
                      onClick={() => handleUndoLike(postId)}
                    />
                  ) : (
                    <FaRegHeart onClick={() => handleLike(postId)} />
                  )}
                  <p>{post.likes.length} likes</p>
                </div>
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
      <form
        onSubmit={handleAddComment}
        className="my-6 flex items-center justify-around "
      >
        <input
          type="text"
          className="min-w-5/6 border border-gray-300 dark:border-gray-600
           bg-white dark:bg-gray-900 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-400"
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button
          type="submit"
          className=" px-4 max-w-1/6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isCommenting ? (
            <ClipLoader
              color="white"
              loading={true}
              size={20}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          ) : (
            <IoSend />
          )}{" "}
        </button>
      </form>

      {/* Comment List */}
      {comments.length ? (
        <div className="space-y-4">
          {comments
            .filter((c) => !c.isReply)
            .map((mainComment) => {
              return (
                <div
                  key={mainComment._id}
                  className="flex relative flex-col items-start space-y-3 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg"
                >
                  {/* ==== Main Comment ==== */}
                  <div className="w-full relative flex gap-3 flex-col">
                    <div className="flex space-x-3">
                      {mainComment.author.avatar ? (
                        <img
                          src={mainComment.author.avatar}
                          alt="user"
                          className="h-6 w-6 object-cover rounded-full"
                        />
                      ) : (
                        <FaUserCircle className="text-2xl text-gray-600 dark:text-white mt-1" />
                      )}
                      <div className="w-full">
                        <div className="flex w-[90%] items-center justify-between">
                          <p
                            className="font-bold text-blue-500 cursor-pointer hover:underline"
                            onClick={() =>
                              navigate(`/user/${mainComment.author.id}`)
                            }
                          >
                            {mainComment.author.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {timeAgo(mainComment.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {editingComment === mainComment._id ? (
                      <label className="w-full my-1 relative flex justify-end items-center">
                        <input
                          type="text"
                          className="outline-none border rounded p-1 w-full"
                          value={editingCommentText}
                          onChange={(e) =>
                            setEditingCommentText(e.target.value)
                          }
                          autoFocus
                        />
                        {updatingComment === mainComment._id ? (
                          <ClipLoader size={20} color="white" />
                        ) : (
                          <div className="flex justify-center space-x-4 px-3 items-center absolute right-0">
                            <RxCrossCircled
                              onClick={() => setEditingComment("")}
                              className="cursor-pointer"
                            />
                            <IoSend
                              className="cursor-pointer"
                              onClick={() =>
                                handleUpdateComment(mainComment._id)
                              }
                            />
                          </div>
                        )}
                      </label>
                    ) : (
                      <p className="my-1">{mainComment.text}</p>
                    )}

                    <div className="flex space-x-5">
                      <button className="flex items-center">
                        {mainComment.likes &&
                        mainComment.likes.includes(data._id) ? (
                          <FaHeart
                            className="text-red-500 cursor-pointer mr-2"
                            onClick={() =>
                              handleCommentUnlikeClick(mainComment._id)
                            }
                          />
                        ) : (
                          <FaRegHeart
                            className="text-gray-500 text-sm mr-2 cursor-pointer"
                            onClick={() =>
                              handleCommentLikeClick(mainComment._id)
                            }
                          />
                        )}
                        {mainComment.likes.length
                          ? mainComment.likes.length
                          : ""}{" "}
                        like
                      </button>
                      <button
                        className="flex items-center hover:underline"
                        onClick={() =>
                          setReplyingComment(
                            replyingComment === mainComment._id
                              ? ""
                              : mainComment._id
                          )
                        }
                      >
                        <FaComment className="text-gray-500 text-sm mr-2" />{" "}
                        reply
                      </button>
                    </div>
                  </div>

                  {/* Menu */}
                  {(data._id === post.author.id ||
                    data._id === mainComment.author.id) && (
                    <div className="absolute top-3 right-2 cursor-pointer">
                      <BsThreeDotsVertical
                        onClick={() =>
                          setMenuOn(
                            menuOn === mainComment._id ? "" : mainComment._id
                          )
                        }
                      />
                      {menuOn === mainComment._id && (
                        <div
                          className={`flex absolute bg-gray-100 right-3 
                         ${
                           data._id !== mainComment.author.id
                             ? "-top-9"
                             : "-top-18"
                         } rounded-2xl rounded-br-none border min-w-40 flex-col`}
                        >
                          <button
                            onClick={() => handleDeleteComment(mainComment._id)}
                            className={`flex items-center justify-around px-3 ${
                              data._id !== mainComment.author.id
                                ? "rounded-2xl rounded-br-none"
                                : "rounded-t-2xl"
                            }  hover:bg-gray-300 py-2 text-sm`}
                          >
                            {deletingComment === mainComment._id ? (
                              <ClipLoader size={20} color="white" />
                            ) : (
                              <>
                                <FaTrash /> delete comment
                              </>
                            )}
                          </button>
                          {data._id === mainComment.author.id && (
                            <button
                              className="flex items-center justify-around px-3 rounded-bl-2xl hover:bg-gray-300 py-2 text-sm"
                              onClick={() => {
                                setMenuOn("");
                                setEditingComment(
                                  editingComment ? "" : mainComment._id
                                );
                              }}
                            >
                              <FaEdit /> edit comment
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reply Input */}
                  {replyingComment === mainComment._id && (
                    <div className="w-full flex items-center justify-around">
                      {data.avatar ? (
                        <img
                          src={data.avatar}
                          alt="user"
                          className="h-6 w-6 object-cover rounded-full"
                        />
                      ) : (
                        <FaUserCircle className="text-2xl text-gray-600 dark:text-white mt-1" />
                      )}
                      <label className="w-[90%] my-1 relative flex justify-end items-center">
                        <input
                          type="text"
                          className="outline-none border border-gray-400 rounded-xl px-2 p-1 w-full"
                          value={replyingCommentText}
                          onChange={(e) =>
                            setReplyingCommentText(e.target.value)
                          }
                          autoFocus
                        />
                        {isReplying === mainComment._id ? (
                          <ClipLoader size={20} color="white" />
                        ) : (
                          <div className="flex justify-center space-x-4 px-3 items-center absolute right-0">
                            <RxCrossCircled
                              onClick={() => setReplyingComment("")}
                              className="cursor-pointer text-gray-400"
                            />
                            <IoSend
                              onClick={() =>
                                handleReplyComment(mainComment._id)
                              }
                              className="cursor-pointer text-gray-400"
                            />
                          </div>
                        )}
                      </label>
                    </div>
                  )}

                  {/* View Replies Button */}
                  {mainComment.replies.length > 0 &&
                    showReplies !== mainComment._id && (
                      <button
                        onClick={() => setShowReplies(mainComment._id)}
                        className="ml-8 text-blue-500 text-sm hover:underline"
                      >
                        View {mainComment.replies.length}{" "}
                        {mainComment.replies.length > 1 ? "replies" : "reply"}
                      </button>
                    )}

                  {/* ==== Replies ==== */}
                  {showReplies === mainComment._id && (
                    <div className="pl-8  w-full space-y-2">
                      {comments
                        .filter((reply) =>
                          mainComment?.replies?.includes(reply._id)
                        )
                        .map((reply) => (
                          <div
                            key={reply._id}
                            className="flex relative flex-col items-start space-y-3 bg-gray-200 dark:bg-gray-600 p-2 rounded-lg"
                          >
                            <div className="w-full relative flex gap-3 flex-col">
                              <div className="flex space-x-2">
                                {reply.author.avatar ? (
                                  <img
                                    src={reply.author.avatar}
                                    alt="user"
                                    className="h-5 w-5 object-cover rounded-full"
                                  />
                                ) : (
                                  <FaUserCircle className="text-lg text-gray-600 dark:text-white mt-0.5" />
                                )}
                                <div className="w-full">
                                  <div className="flex w-[90%] items-center justify-between">
                                    <span
                                      className="font-semibold text-blue-500 cursor-pointer hover:underline"
                                      onClick={() =>
                                        navigate(`/user/${reply.author.id}`)
                                      }
                                    >
                                      {reply.author.name}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {timeAgo(reply.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Edit Mode */}
                              {editingComment === reply._id ? (
                                <label className="w-full my-1 relative flex justify-end items-center">
                                  <input
                                    type="text"
                                    className="outline-none border rounded p-1 w-full"
                                    value={editingCommentText}
                                    onChange={(e) =>
                                      setEditingCommentText(e.target.value)
                                    }
                                    autoFocus
                                  />
                                  {updatingComment === reply._id ? (
                                    <ClipLoader size={20} color="white" />
                                  ) : (
                                    <div className="flex justify-center space-x-4 px-3 items-center absolute right-0">
                                      <RxCrossCircled
                                        onClick={() => setEditingComment("")}
                                        className="cursor-pointer"
                                      />
                                      <IoSend
                                        onClick={() =>
                                          handleUpdateComment(reply._id)
                                        }
                                      />
                                    </div>
                                  )}
                                </label>
                              ) : (
                                <p className="my-1">{reply.text}</p>
                              )}

                              <div className="flex space-x-5">
                                <button className="flex items-center ">
                                  {reply.likes &&
                                  reply.likes.includes(data._id) ? (
                                    <FaHeart
                                      className="text-red-500 cursor-pointer mr-2"
                                      onClick={() =>
                                        handleCommentUnlikeClick(reply._id)
                                      }
                                    />
                                  ) : (
                                    <FaRegHeart
                                      className="text-gray-500 text-sm mr-2  cursor-pointer"
                                      onClick={() =>
                                        handleCommentLikeClick(reply._id)
                                      }
                                    />
                                  )}
                                  {reply.likes.length ? reply.likes.length : ""}{" "}
                                  like
                                </button>
                                <button
                                  className="flex items-center hover:underline"
                                  onClick={() =>
                                    setReplyingComment(
                                      replyingComment === reply._id
                                        ? ""
                                        : reply._id
                                    )
                                  }
                                >
                                  <FaComment className="text-gray-500 text-sm mr-2" />{" "}
                                  reply
                                </button>
                              </div>
                            </div>

                            {/* Reply Menu */}
                            {(data._id === post.author.id ||
                              data._id === reply.author.id) && (
                              <div className="absolute top-3 right-2 cursor-pointer">
                                <BsThreeDotsVertical
                                  onClick={() =>
                                    setMenuOn(
                                      menuOn === reply._id ? "" : reply._id
                                    )
                                  }
                                />
                                {menuOn === reply._id && (
                                  <div
                                    className={`flex absolute bg-gray-100 right-3 
                         ${
                           data._id !== reply.author.id ? "-top-9" : "-top-18"
                         } rounded-2xl rounded-br-none border min-w-40 flex-col`}
                                  >
                                    <button
                                      onClick={() =>
                                        handleDeleteComment(reply._id)
                                      }
                                      className={`flex items-center justify-around px-3 ${
                                        data._id !== reply.author.id
                                          ? "rounded-2xl rounded-br-none"
                                          : "rounded-t-2xl"
                                      }  hover:bg-gray-300 py-2 text-sm`}
                                    >
                                      {deletingComment === reply._id ? (
                                        <ClipLoader size={20} color="white" />
                                      ) : (
                                        <>
                                          <FaTrash /> delete comment
                                        </>
                                      )}
                                    </button>
                                    {data._id === reply.author.id && (
                                      <button
                                        className="flex items-center justify-around px-3 rounded-bl-2xl hover:bg-gray-300 py-2 text-sm"
                                        onClick={() => {
                                          setMenuOn("");
                                          setEditingComment(
                                            editingComment ? "" : reply._id
                                          );
                                        }}
                                      >
                                        <FaEdit /> edit comment
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Reply-to-a-Reply Input — sends to main comment */}
                            {replyingComment === reply._id && (
                              <div className="w-full flex items-center justify-around">
                                {data.avatar ? (
                                  <img
                                    src={data.avatar}
                                    alt="user"
                                    className="h-6 w-6 object-cover rounded-full"
                                  />
                                ) : (
                                  <FaUserCircle className="text-2xl text-gray-600 dark:text-white mt-1" />
                                )}
                                <label className="w-[90%] my-1 relative flex justify-end items-center">
                                  <input
                                    type="text"
                                    className="outline-none border border-gray-400 rounded-xl px-2 p-1 w-full"
                                    value={replyingCommentText}
                                    onChange={(e) =>
                                      setReplyingCommentText(e.target.value)
                                    }
                                    autoFocus
                                  />
                                  {isReplying === reply._id ? (
                                    <ClipLoader size={20} color="white" />
                                  ) : (
                                    <div className="flex justify-center space-x-4 px-3 items-center absolute right-0">
                                      <RxCrossCircled
                                        onClick={() => setReplyingComment("")}
                                        className="cursor-pointer text-gray-400"
                                      />
                                      <IoSend
                                        onClick={() =>
                                          handleReplyComment(mainComment._id)
                                        }
                                        className="cursor-pointer text-gray-400"
                                      />
                                    </div>
                                  )}
                                </label>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      ) : (
        <p className="mx-auto max-w-50">No comments for this post</p>
      )}
    </div>
  );
};

export default PostDetails;
