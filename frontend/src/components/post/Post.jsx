import { useEffect } from "react";
import useChatStore from "../../stores/chatStore";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaHeart,
  FaShareAlt,
  FaComment,
  FaRegHeart,
  FaEdit,
} from "react-icons/fa";
import { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoDocumentTextOutline } from "react-icons/io5";
//external
import timeAgo from "../../hooks/timeAgo";
import getPrivacyIcon from "../../hooks/post/getPrivacyIcons";
import doLike from "../../hooks/post/doLike";
import undoLike from "../../hooks/post/undoLike";

export default function Post({
  post,
  likedPostIds,
  setLikedPostIds,
  likeCount,
}) {
  const [menuOn, setMenuOn] = useState(false);
  const [postLike, setPostLike] = useState(likeCount);
  const [userId, setUserId] = useState(
    JSON.parse(localStorage.getItem("userId"))?.value
  );
  const navigate = useNavigate();
  const doLikeHandler = async (id) => {
    await doLike(id);
    setLikedPostIds((prev) => [...prev, id]);
    setPostLike((prev) => prev + 1);
  };
  const undoLikeHandler = async (id) => {
    await undoLike(id);
    setLikedPostIds((prev) => prev.filter((pid) => pid !== id));
    setPostLike((prev) => prev - 1);
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 relative ">
        <div
          className="flex cursor-pointer hover:text-blue-600 space-x-2 items-center"
          onClick={() => navigate(`/user/${post.author.id}`)}
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
        <BsThreeDotsVertical
          className="cursor-pointer"
          onClick={() => setMenuOn(!menuOn)}
        />
        {menuOn && (
          <div
            className="absolute right-5 top-3 flex flex-col items-center
           rounded-2xl rounded-tr-none border z-50 bg-gray-50 border-gray-500"
          >
            {userId === post.author.id && (
              <button
                onClick={() => navigate(`/edit-post/${post._id}`)}
                className="px-2 space-x-1 p-1 cursor-pointer w-32 rounded-tl-2xl
                 hover:bg-gray-300 flex items-center justify-center"
              >
                <FaEdit />
                <p>edit post</p>
              </button>
            )}
            <button
              className={`px-2 space-x-1 p-1 w-32 ${
                userId === post.author.id
                  ? " rounded-b-2xl"
                  : " rounded-2xl rounded-tr-none "
              } hover:bg-gray-300 cursor-pointer flex items-center justify-center`}
              onClick={() => navigate(`/post-details/${post._id}`)}
            >
              <IoDocumentTextOutline />
              <p>see details</p>
            </button>
          </div>
        )}
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
                navigate(`/image-preview?url=${img.url}`);
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
            {postLike || 0} Likes
          </div>

          <button
            className="flex hover:underline items-center cursor-pointer gap-1 hover:text-indigo-600 transition"
            onClick={() => navigate(`/post-details/${post._id}`)}
          >
            <FaComment />
            {post.comments.length} Comments
          </button>
        </div>

        <button className="flex items-center gap-1 hover:text-indigo-600 transition">
          <FaShareAlt />
          Share
        </button>
      </div>
    </>
  );
}
