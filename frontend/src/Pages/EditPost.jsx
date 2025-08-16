// EditPost.jsx
import React, { useState, useEffect } from "react";
import { FaTrash, FaEdit, FaCommentSlash, FaComment } from "react-icons/fa";
import { IoPersonCircle } from "react-icons/io5";
import { useParams, useNavigate, data } from "react-router-dom";
import getPrivacyIcons from "../hooks/getPrivacyIcons";
import useChatStore from "../stores/chatStore";

const EditPost = ({ data }) => {
  const [post, setPost] = useState({});
  const [editPost, setEditPost] = useState({
    text: "",
    images: [],
    isEnableComments: true,
    privacy: "public",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { postId } = useParams();
  const navigate = useNavigate();

  const popUpMsg = useChatStore((s) => s.setPopUpMessage);

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/feeds/post/${postId}`,
        { credentials: "include" }
      );
      const postData = await res.json();
      if (!res.ok) throw new Error(data.error || "Error finding post");

      if (data._id !== postData.author?.id) {
        throw new Error("something went wrong");
      }
      setPost(postData);
      setEditPost({
        text: postData.text || "",
        images: postData.images || [],
        isEnableComments: postData.isEnableComments,
        privacy: postData.privacy || "public",
      });
    } catch (error) {
      popUpMsg(error.message);
      if (error.message === "something went wrong") {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handles text, privacy, comments toggle, and file uploads
  const handleInput = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setEditPost((prev) => ({
        ...prev,
        images: files,
      }));
    } else {
      setEditPost((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const toggleComments = () => {
    setEditPost((prev) => ({
      ...prev,
      isEnableComments: !prev.isEnableComments,
    }));
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("text", editPost.text);
      formData.append("privacy", editPost.privacy);
      formData.append("isEnableComments", editPost.isEnableComments);

      if (editPost.images && editPost.images.length > 0) {
        for (let i = 0; i < editPost.images.length; i++) {
          formData.append("images", editPost.images[i]);
        }
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/feeds/post/${postId}`,
        {
          method: "PUT",
          body: formData,
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error updating post");

      alert("✅ Post updated successfully!");
      setIsEditing(false);
      setPost(data); // Update UI with saved data
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("❌ Are you sure you want to delete this post?"))
      return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/feeds/post/${postId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error deleting post");

      alert("Post deleted!");
      navigate("/"); // Redirect after delete
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-5 rounded-2xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        {data.avatar ? (
          <img
            src={data.avatar}
            alt="User Avatar"
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <IoPersonCircle className="w-10 h-10 text-gray-500" />
        )}
        <div>
          <h2 className="font-semibold">{data.name || "Unknown User"}</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {getPrivacyIcons(post.privacy)} {post.privacy}
          </div>
        </div>
      </div>

      {/* Post Text */}
      {isEditing ? (
        <textarea
          value={editPost.text}
          name="text"
          onChange={handleInput}
          className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-300"
          rows="3"
        />
      ) : (
        <p className="mb-3 text-gray-800">{post.text}</p>
      )}

      {/* Attachment */}
      {Array.isArray(post.images) &&
        post.images.length > 0 &&
        post.images.map((image) => (
          <div key={image.public_id} className="mb-3">
            <img
              src={image.url}
              alt="images"
              className="rounded-lg border border-gray-200"
            />
          </div>
        ))}

      {/* File Upload */}
      {isEditing && (
        <input
          type="file"
          accept="image/*"
          name="images"
          multiple
          onChange={handleInput}
          className="mb-3 block w-full text-sm text-gray-600"
        />
      )}

      {/* Privacy + Comments Toggle */}
      <div className="flex items-center justify-between mb-4">
        <select
          name="privacy"
          value={editPost.privacy}
          onChange={handleInput}
          className="border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-300"
        >
          <option value="public">🌍 Public</option>
          <option value="friends">👥 Friends</option>
          <option value="private">🔒 Only Me</option>
        </select>

        <button
          type="button"
          onClick={toggleComments}
          className="flex items-center gap-2 border px-3 py-2 rounded-lg text-sm hover:bg-gray-100"
        >
          {editPost.isEnableComments ? <FaCommentSlash /> : <FaComment />}
          {editPost.isEnableComments ? "Disable" : "Enable"} Comments
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {isEditing ? (
          <button
            onClick={handleSave}
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg shadow-sm"
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg shadow-sm flex items-center gap-2"
          >
            <FaEdit /> Edit
          </button>
        )}

        <button
          onClick={handleDelete}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg shadow-sm flex items-center gap-2"
        >
          <FaTrash /> Delete
        </button>
      </div>
    </div>
  );
};

export default EditPost;
