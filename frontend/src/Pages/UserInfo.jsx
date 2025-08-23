//internal imports
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { IoLogOut, IoPersonCircle } from "react-icons/io5";
import { FaCamera, FaPlus, FaUsers } from "react-icons/fa";
import useChatStore from "../stores/chatStore";
import { FaX } from "react-icons/fa6";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

import Post from "../components/post/Post";
import { format } from "date-fns";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdEdit } from "react-icons/md";
import PageTitle from "@/utilities/PageTitle";

const UserInfo = () => {
  //for avatar
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadedAvatar, setUploadedAvatar] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  //for cover
  const [coverPreview, setCoverPreview] = useState(null);
  const [coverSrc, setCoverSrc] = useState("");
  const [uploadedCover, setUploadedCover] = useState(null);
  const [coverUploading, setCoverUploading] = useState(false);
  // for post
  const [posts, setPosts] = useState([]);
  const [likedPostIds, setLikedPostIds] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({});
  const [error, setError] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { userId } = useParams();

  const navigate = useNavigate();
  const setMsg = useChatStore((s) => s.setPopUpMessage);
  const setGlobal = useChatStore((s) => s.setIsOpenGlobal);

  useEffect(() => {
    fetchData();
    fetchPost();
    setGlobal(false);
    if (!localStorage.getItem("userId")) {
      location.replace("/login");
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!posts || !userId) return;

    const likedPost = posts.filter((post) => post.likes.includes(userId));
    const likedIds = likedPost.map((post) => post._id);
    setLikedPostIds(likedIds);
  }, [posts, userId]);

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
      setCoverSrc(data?.cover?.[0]?.src);
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
  const handleCoverInput = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedCover(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleCoverUpload = async () => {
    setCoverUploading(true);
    try {
      const formData = new FormData();
      formData.append("cover", uploadedCover);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/cover`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Error uploading cover");

      const data = await res.json();
      setCoverSrc(data?.cover?.[0]?.src);
      setUser(data);
      setMsg("cover changed successfully");
    } catch (error) {
      setMsg(error.message);
    } finally {
      setCoverUploading(false);
      setCoverPreview(null);
      setUploadedCover(null);
    }
  };

  const handleAvatarInput = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", uploadedAvatar);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/avatar`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Error uploading avatar");

      const data = await res.json();
      setUser(data);
      setMsg("avatar changed successfully");
    } catch (error) {
      setMsg(error.message);
    } finally {
      setAvatarUploading(false);
      setAvatarPreview(null);
      setUploadedAvatar(null);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Logout failed");

      await res.json();
      localStorage.removeItem("userId");
      setMsg("logout successful");
      location.replace("/login");
    } catch (error) {
      setMsg(error.message || "Something went wrong during logout");
    } finally {
      setLoggingOut(false);
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
      <PageTitle title="You - social_box application" />
      <div className="relative h-56 max-w-3xl mx-auto">
        {coverPreview && !coverUploading ? (
          <>
            <img
              src={coverPreview}
              alt="uploaded-cover"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute right-4 space-y-2 bottom-4 z-40">
              <span
                className="flex text-green-400 items-center space-x-2 p-1 px-2 rounded-2xl bg-white cursor-pointer"
                onClick={handleCoverUpload}
              >
                <FaPlus /> <p>upload</p>
              </span>
              <span
                className="flex text-red-400 items-center space-x-2 p-1 px-2 rounded-2xl bg-white cursor-pointer"
                onClick={() => setCoverPreview(null)}
              >
                <FaX /> <p>undo</p>
              </span>
            </div>
          </>
        ) : coverUploading ? (
          <div className="flex justify-center items-center w-full h-56">
            <ClipLoader color="white" loading={true} size={50} />
          </div>
        ) : (
          <img
            src={coverSrc}
            onClick={() => {
              navigate(`/image-preview?url=${coverSrc}`);
            }}
            alt="cover"
            className="w-full h-full object-cover object-center"
          />
        )}

        {!coverPreview && !coverUploading && (
          <label
            className={`absolute ${
              user.cover?.[0]?.src
                ? "bottom-3 left-3"
                : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            } z-20 flex items-center justify-center cursor-pointer`}
          >
            {user.cover?.[0]?.src ? (
              <FaCamera className="text-gray-400 text-lg" />
            ) : (
              <>
                <p className="text-gray-400">add a cover</p>
                <FaCamera className="text-gray-400 text-2xl ml-2" />
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverInput}
            />
          </label>
        )}

        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-[-4rem] left-16 flex items-center gap-4">
          <div className="relative">
            {avatarPreview && !avatarUploading ? (
              <>
                <img
                  src={avatarPreview}
                  alt="avatar-preview"
                  className="w-32 h-32 rounded-full bg-gray-50 border-4 border-white dark:border-gray-900 shadow-lg object-cover"
                />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
                  <span
                    className="p-1 px-2 bg-white text-green-500 text-sm rounded-full cursor-pointer flex items-center gap-1"
                    onClick={handleAvatarUpload}
                  >
                    <FaPlus />
                  </span>
                  <span
                    className="p-1 px-2 bg-white text-red-500 text-sm rounded-full cursor-pointer flex items-center gap-1"
                    onClick={() => setAvatarPreview(null)}
                  >
                    <FaX />
                  </span>
                </div>
              </>
            ) : avatarUploading ? (
              <div className="w-32 h-32 flex justify-center items-center bg-white rounded-full border-4 border-white dark:border-gray-900 shadow-lg">
                <ClipLoader color="black" size={30} />
              </div>
            ) : user.avatar ? (
              <img
                src={user.avatar}
                onClick={() => {
                  navigate(`/image-preview?url=${user?.avatar}`);
                }}
                alt="avatar"
                className="w-32 h-32 rounded-full bg-gray-50 border-4 border-white dark:border-gray-900 shadow-lg object-cover"
              />
            ) : (
              <IoPersonCircle className="text-[132px] bg-gray-300 rounded-full" />
            )}

            {!avatarUploading && !avatarPreview && (
              <label className="absolute bottom-1 right-1 p-1 bg-white rounded-full cursor-pointer shadow-md">
                <FaCamera className="text-gray-700 text-sm" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarInput}
                />
              </label>
            )}
          </div>
          <div className="mt-10">
            <div className="flex items-center ">
              <div className="mr-3">
                {" "}
                <p className="text-2xl font-bold">{user?.name}</p>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
            </div>
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
            <button
              onClick={() => navigate("/friends")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"
            >
              <FaUsers /> friends
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="cursor-pointer">
                  <BsThreeDotsVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel className="text-center font-bold">
                  {" "}
                  Option
                </DropdownMenuLabel>

                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate("/edit-profile")}
                >
                  <MdEdit /> Edit Profile
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleLogout}
                >
                  <IoLogOut /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {user.dob && (
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span className="font-medium">📅 Date of birth:</span>
              <span>{format(user.dob, "do MMMM yyyy (EEEE)")}</span>
            </div>
          )}

          {user.location && (
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span className="font-medium">📍 Location:</span>
              <span>{user.location}</span>
            </div>
          )}

          {user.website && (
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span className="font-medium">🌐 Website:</span>
              <a
                onClick={() => window.open(`https://${user.website}`, "_blank")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 cursor-pointer dark:text-indigo-400 hover:underline"
              >
                {user.website}
              </a>
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-6 border-y dark:border-gray-700 py-6">
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
            <div
              key={i}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {item.value}
              </p>
              <p className="text-sm capitalize text-gray-500 dark:text-gray-400">
                {item.label}
              </p>
            </div>
          ))}
        </div>
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

export default UserInfo;
