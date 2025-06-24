import React, { useState, useEffect } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { toast, ToastContainer } from "react-toastify";
const Login = ({ data }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [usernameError, setUsernameError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (data?.isLoggedIn) {
      location.replace(
        `/user-info/${JSON.parse(localStorage.getItem("username")).value}`
      );
    }
  }, []);

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "username") {
      setUsernameError(null);
    } else {
      setPasswordError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log({ res });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error("error login , i am from frontend");
        return;
      }

      const data = await res.json();
      localStorage.setItem(
        "username",
        JSON.stringify({
          value: data.username,
          expiry: Date.now() + 86400000,
        })
      );
      location.replace(`/user-info/${data.username}`);
    } catch (err) {
      toast.error(err.message);
      console.error(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <ToastContainer />
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm"
      >
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

        <div className="mb-4">
          <label
            htmlFor="username"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Username
          </label>
          <input
            type="text"
            name="username"
            id="username"
            value={formData.username}
            onChange={handleInput}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        {usernameError && (
          <div className="mb-4 text-sm text-red-600 font-medium">
            {usernameError}
          </div>
        )}
        <div className="mb-2 relative">
          <label
            htmlFor="password"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            id="password"
            value={formData.password}
            onChange={handleInput}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {passwordError && (
            <div className="mb-4 text-sm text-red-600 font-medium">
              {passwordError}
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-[38px] text-gray-600 hover:text-gray-800"
          >
            {showPassword ? <IoEyeOff /> : <IoEye />}
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Login;
