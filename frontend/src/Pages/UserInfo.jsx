import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Navigate, useParams } from "react-router-dom";
import { ClipLoader } from "react-spinners";

const UserInfo = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({});
  const [error, setError] = useState(false);
  const { username } = useParams();
  const [isTimeOut, setIsTimeOut] = useState(false);

  useEffect(() => {
    fetchData();
    if (localStorage.getItem("username") === null || undefined) {
      location.replace("/login");
    }
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/login/${username}`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("User not found");
      const data = await res.json();
      setUser(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Logout failed");

      const data = await res.json();
      localStorage.removeItem("username");
      location.replace("/login");
    } catch (error) {
      toast.error(error.message || "Something went wrong during logout");
    }
  };

  if (isTimeOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-300">
        <div className="bg-sky-300 p-8 rounded-xl shadow-lg max-w-sm w-full text-center">
          <p className="text-red-600 font-medium text-lg mb-4">
            Session expired.
          </p>
          <a href="/login" className="text-blue-600 hover:underline text-sm">
            Please click here to re-login
          </a>
        </div>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-sky-300">
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
    <div className="min-h-screen flex items-center justify-center bg-sky-300">
      <div className="bg-sky-200 p-8 rounded-2xl shadow-xl w-full max-w-sm text-center">
        <h2 className="text-2xl font-semibold mb-6">User Info</h2>

        <img
          src={user?.avatar}
          alt="avatar"
          className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-blue-500"
        />

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
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserInfo;
