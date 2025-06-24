import React, { forwardRef, useState } from "react";
import {
  IoEye,
  IoEyeOff,
  IoPersonAddSharp,
  IoPersonRemoveSharp,
} from "react-icons/io5";
import { toast, ToastContainer } from "react-toastify";

const Example = forwardRef(({ handleModalOpen }, ref) => {
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const [role, setRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    avatar: null,
  });

  const handleChange = (e) => {
    if (e.target.name === "avatar") {
      const file = e.target.files[0];
      if (file) {
        setFormData({ ...formData, avatar: file });
        setPreview(URL.createObjectURL(file)); // Generate preview URL
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };
  const handleRole = (e) => {
    setRole(e.target.value);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("mobile", formData.mobile);
    data.append("password", formData.password);
    data.append("role", role);
    if (formData.avatar) {
      data.append("avatar", formData.avatar);
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users`,
        {
          method: "POST",
          body: data,
          credentials: "include",
        }
      );

      const result = await response.json();
      console.log(result);
      if (!response.ok) {
        setErrors(result.errors || {});
      } else {
        setErrors({});
        toast("User created successfully!");
        handleModalOpen(false);
        setTimeout(() => {
          location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast("An error occurred. Please try again.");
    }
  };

  return (
    <div
      ref={ref}
      className="w-[400px] h-[550px] rounded fixed top-1/2 left-1/2 transform
       -translate-x-1/2 -translate-y-1/2 border bg-gray-600 overflow-auto"
    >
      {" "}
      <p className="text-center mt-2 text-4xl text-red-500 font-bold ">
        Add user
      </p>
      <ToastContainer />
      <form
        className="flex flex-col w-full min-h-[80%] justify-between p-5"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <input
          type="text"
          name="name"
          placeholder="Enter name"
          value={formData.name}
          onChange={handleChange}
          className={`outline-none bg-gray-500 focus:bg-gray-300 p-2 rounded my-1 ${
            errors.name ? "border border-red-500" : ""
          }`}
        />
        {errors.name && (
          <p className="text-red-400 text-sm mb-2">{errors.name.msg}</p>
        )}

        <input
          type="email"
          name="email"
          placeholder="Enter email"
          value={formData.email}
          onChange={handleChange}
          className={`outline-none bg-gray-500 focus:bg-gray-300 p-2 rounded my-1 ${
            errors.email ? "border border-red-500" : ""
          }`}
        />
        {errors.email && (
          <p className="text-red-400 text-sm mb-2">{errors.email.msg}</p>
        )}

        <input
          type="text"
          name="mobile"
          placeholder="Enter mobile number"
          value={formData.mobile}
          onChange={handleChange}
          className={`outline-none bg-gray-500 focus:bg-gray-300 p-2 rounded my-1 ${
            errors.mobile ? "border border-red-500" : ""
          }`}
        />
        {errors.mobile && (
          <p className="text-red-400 text-sm mb-2">{errors.mobile.msg}</p>
        )}
        <label htmlFor="password" className=" relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className={`outline-none w-full bg-gray-500 focus:bg-gray-300 p-2 rounded my-1 ${
              errors.password ? "border border-red-500" : ""
            }`}
          />
          {showPassword ? (
            <div
              onClick={() => {
                setShowPassword(false);
              }}
              className="absolute right-3.5 top-4 text-gray-900"
            >
              {" "}
              <IoEyeOff />
            </div>
          ) : (
            <div
              onClick={() => {
                setShowPassword(true);
              }}
              className="absolute right-3.5 top-4 text-gray-900"
            >
              {" "}
              <IoEye />
            </div>
          )}
        </label>
        {errors.password && (
          <p className="text-red-400 text-sm mb-2">{errors.password.msg}</p>
        )}
        <div className="mt-1">
          <label className="text-sm">
            <input
              className="h-2 w-2"
              onChange={handleRole}
              type="radio"
              name="role"
              value="user"
            />{" "}
            user{" "}
          </label>
          <label className="text-sm">
            {" "}
            <input
              className="h-2 w-2 ml-3"
              onChange={handleRole}
              type="radio"
              name="role"
              value="admin"
            />{" "}
            admin{" "}
          </label>
        </div>

        <label
          htmlFor="avatar"
          className={`bg-gray-500 focus:bg-gray-300 p-2 rounded my-1 cursor-pointer ${
            errors.avatar ? "border border-red-500" : ""
          }`}
        >
          {preview ? "change the photo" : "Upload your photo"}
          <input
            type="file"
            name="avatar"
            id="avatar"
            className="hidden"
            accept=".jpg,.jpeg,.png"
            onChange={handleChange}
          />
        </label>
        {errors.avatar && (
          <p className="text-red-400 text-sm mb-2">{errors.avatar.msg}</p>
        )}

        {/* ✅ Image preview */}
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-20 object-fill h-20 rounded-full  border mx-auto my-0 "
          />
        )}

        <div className="flex gap-4 justify-around mt-6">
          <button
            type="submit"
            className="bg-blue-300 rounded-3xl flex items-center
             gap-2 p-2 px-6 hover:bg-cyan-200 ring ring-offset-0 capitalize"
          >
            <IoPersonAddSharp />
            Create
          </button>
          <button
            type="button"
            className="bg-red-500 rounded-3xl flex items-center gap-2 p-2 px-6 hover:bg-red-200 ring ring-offset-0 capitalize"
            onClick={() => handleModalOpen(false)}
          >
            <IoPersonRemoveSharp />
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
});

export default Example;
