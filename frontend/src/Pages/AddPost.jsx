import PageTitle from "@/utilities/PageTitle";
import { useState } from "react";
import {
  FaUserCircle,
  FaImage,
  FaPaperPlane,
  FaLock,
  FaUsers,
  FaGlobe,
  FaCommentSlash,
  FaCommentDots,
} from "react-icons/fa";
import { useNavigate } from "react-router";
import { ClipLoader } from "react-spinners";

const privacyOptions = [
  { label: "Public", icon: <FaGlobe />, value: "public" },
  { label: "Friends", icon: <FaUsers />, value: "friends" },
  { label: "Only Me", icon: <FaLock />, value: "private" },
];

export default function AddPost({ user }) {
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [privacy, setPrivacy] = useState("public");
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [showPrivacyMenu, setShowPrivacyMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      setPreviews((prev) => [...prev, URL.createObjectURL(file)]);
    });
    if (files) {
      setImages((prev) => [...prev, ...files]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = new FormData();

      if (images) {
        images.forEach((image) => {
          data.append("attachment", image);
        });
      }
      if (text) {
        data.append("text", text);
      }
      if (privacy) {
        data.append("privacy", privacy);
      }
      data.append("isEnableComments", commentsEnabled);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/feeds`, {
        method: "POST",
        credentials: "include",
        body: data,
      });
      if (!res.ok) {
        throw new Error("error submitting post");
      }

      // Reset
      setText("");
      setImages(null);
      setPrivacy("public");
      setCommentsEnabled(true);
    } catch (error) {
      console.log(error.message);
    } finally {
      setIsLoading(false);
      navigate("/");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded-2xl shadow border">
      {/* Header */}
      <PageTitle title="add post - social_box application" />
      <div className="flex items-center gap-3 mb-4">
        {user.avatar ? (
          <img src={user.avatar} alt="user" className="h-9 w-9 rounded-full" />
        ) : (
          <FaUserCircle className="text-4xl text-gray-500" />
        )}

        <div>
          <h2 className="font-semibold text-lg">{user.name}</h2>
          <div className="relative">
            <button
              type="button"
              className="text-sm text-gray-500 hover:text-black flex items-center gap-1"
              onClick={() => setShowPrivacyMenu((prev) => !prev)}
            >
              {privacyOptions.find((opt) => opt.value === privacy)?.icon}
              {privacyOptions.find((opt) => opt.value === privacy)?.label}
            </button>

            {showPrivacyMenu && (
              <div className="absolute mt-1 bg-white border shadow rounded-xl z-10">
                {privacyOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setPrivacy(opt.value);
                      setShowPrivacyMenu(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 text-sm w-full hover:bg-gray-100 ${
                      privacy === opt.value ? "font-bold text-blue-600" : ""
                    }`}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={4}
          placeholder="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* Image Preview */}
        {previews.length > 0 &&
          previews.map((image) => (
            <div className="mt-4 relative" key={image}>
              <img
                src={image}
                alt="Preview"
                className="max-h-64 w-full object-cover rounded-xl border"
              />
            </div>
          ))}

        {/* Bottom Controls */}
        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
          {/* Image Upload */}
          <label className="flex items-center gap-2 cursor-pointer text-blue-500">
            <FaImage />
            <span className="text-sm font-medium">Add Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              name="attachment"
              maxLength={5}
              multiple
            />
          </label>

          {/* Toggle Comments */}
          <button
            type="button"
            onClick={() => setCommentsEnabled((prev) => !prev)}
            className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl border ${
              commentsEnabled
                ? "text-green-600 border-green-200 hover:bg-green-50"
                : "text-red-600 border-red-200 hover:bg-red-50"
            }`}
          >
            {commentsEnabled ? <FaCommentDots /> : <FaCommentSlash />}
            {commentsEnabled ? "Comments On" : "Comments Off"}
          </button>

          {/* Submit */}
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
          >
            {isLoading ? (
              <ClipLoader
                color="gray"
                loading={true}
                size={20}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            ) : (
              <>
                <FaPaperPlane /> Post
              </>
            )}{" "}
          </button>
        </div>
      </form>
    </div>
  );
}
