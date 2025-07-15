//internal imports
import React, { useState, useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { IoPersonCircle } from "react-icons/io5";
import useChatStore from "../stores/chatStore";

const UserInfo = () => {
  //use useState for state lifting
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({});
  const [error, setError] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { userId } = useParams();

  const setMsg = useChatStore((s) => s.setPopUpMessage);

  //useEffect for fetching the user data
  useEffect(() => {
    fetchData();
    if (localStorage.getItem("userId") === null || undefined) {
      //return to login if user is not logged in
      location.replace("/login");
    }
  }, []);
  //async func for send api request by fetch-api
  const fetchData = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/login/${userId}`,
        {
          credentials: "include",
        }
      );
      //take action by given response
      if (!res.ok) throw new Error("User not found");
      const data = await res.json();
      // set the given response data as user
      setUser(data);
      setMsg(`welcome ${data.name}`);
    } catch (err) {
      //take action if error happens
      setMsg(err.message || "Something went wrong");
      setError(err.message || "Something went wrong");
    } finally {
      //shut off the loader
      setIsLoading(false);
    }
  };

  //async function for logging out
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      //send request for log out
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: "DELETE",
        credentials: "include",
      });
      //take action by given response
      if (!res.ok) throw new Error("Logout failed");

      const data = await res.json();
      // remove userId from localStorage
      localStorage.removeItem("userId");
      setMsg("logout successful");
    } catch (error) {
      //take action if error occurred
      setMsg(error.message || "Something went wrong during logout");
    } finally {
      //return to login page
      location.replace("/login");
      //finally of the loader
      setLoggingOut(false);
    }
  };

  // return only loader while loading or sending request to backend
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen ">
        <ClipLoader
          color="white"
          loading={true}
          size={100}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
    );
  }
  if (error) return <div>Error: {error}</div>;
  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className=" p-8 rounded-2xl shadow-xl w-full max-w-sm text-center">
        <h2 className="text-2xl font-semibold  mb-6">User Info</h2>

        {user.avatar ? (
          <img
            src={user.avatar}
            alt="avatar"
            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-blue-500"
          />
        ) : (
          <IoPersonCircle className="text-[96px] mx-auto" />
        )}
        {/* serve the information of client */}
        <p className="mb-2 text-gray-700">
          <strong>Name:</strong> {user?.name}
        </p>
        <p className="mb-2 text-gray-700">
          <strong>Email:</strong> {user?.email}
        </p>
        <p className="mb-2 text-gray-700">
          <strong>Mobile:</strong> {user?.mobile}
        </p>
        <p className="mb-6 text-gray-700">
          <strong>Role:</strong> {user?.role}
        </p>

        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          {/* clip loader  when processing*/}
          {loggingOut ? (
            <ClipLoader
              color="white"
              loading={true}
              size={25}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          ) : (
            " Logout"
          )}
        </button>
      </div>
    </div>
  );
};

export default UserInfo;
