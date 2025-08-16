//internal imports
import React, { forwardRef, useState } from "react";
import {
  IoAdd,
  IoEye,
  IoEyeOff,
  IoPersonAddSharp,
  IoPersonCircle,
  IoPersonRemoveSharp,
  IoSwapHorizontal,
} from "react-icons/io5";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router";
// external imports
import PageTitle from "../components/PageTitle";
import useChatStore from "../stores/chatStore";

const AddUser = () => {
  //useStates
  const [isLoading, setIsLoading] = useState(false);
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
  //toast
  const setMsg = useChatStore((s) => s.setPopUpMessage);
  const navigate = useNavigate();
  //handle input changes
  const handleChange = (e) => {
    //there is file than fill the avatar
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
  //radio button handling for role
  const handleRole = (e) => {
    setRole(e.target.value);
  };

  //submit handler/ send post request to backend
  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    //create a new form data
    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("mobile", formData.mobile);
    data.append("password", formData.password);
    data.append("role", role);
    if (formData.avatar) {
      data.append("avatar", formData.avatar);
    }
    //send post request
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users`,
        {
          method: "POST",
          body: data,
          credentials: "include",
        }
      );

      const result = await response.json(); //format the response
      //take actions according to given response
      if (!response.ok) {
        setErrors(result.errors || {});
        setIsLoading(false);
        throw new Error("submit error");
      } else {
        //if there is no error go back to user page
        setErrors({});
        setMsg("successfully created");
        navigate("/users");
      }
    } catch (error) {
      setMsg("Error submitting form:", error.message);
    } finally {
      // finally set isLoading to false
      if (!isLoading) {
      }
    }
  };

  return (
    <>
      {" "}
      <PageTitle title="add-user" />
      <div
        className="rounded max-h-[100vh] max-w-3xl mx-auto p-10 overflow-scroll 
      scrollbar-hide bg-gray-100 dark:bg-gray-700"
      >
        {" "}
        <p className="text-center mt-2 text-2xl text-black dark:text-white font-bold ">
          users information
        </p>
        <form
          className="flex flex-col w-full min-h-[100%]  justify-between p-5"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          {" "}
          <label
            htmlFor="name"
            className="text-sm text-gray-600 dark:text-gray-200 tracking-wider normal-case"
          >
            {" "}
            enter name:{" "}
          </label>
          <input
            type="text"
            name="name"
            placeholder="adam"
            value={formData.name}
            onChange={handleChange}
            className={`outline-none bg-gray-200 focus:bg-white dark:bg-gray-500 dark:focus:bg-gray-300 p-2 rounded my-1 ${
              errors.name ? "border border-red-500" : ""
            }`}
          />
          {errors.name && (
            <p className="text-red-400 text-sm mb-2">{errors.name.msg}</p>
          )}
          <label
            htmlFor="email"
            className="mt-5 text-sm text-gray-600 dark:text-gray-200 tracking-wider normal-case"
          >
            enter email:
          </label>
          <input
            type="email"
            name="email"
            placeholder="name@company.com"
            value={formData.email}
            onChange={handleChange}
            className={`outline-none bg-gray-200 focus:bg-white dark:bg-gray-500 dark:focus:bg-gray-300 p-2 rounded my-1 ${
              errors.email ? "border border-red-500" : ""
            }`}
          />
          {errors.email && (
            <p className="text-red-400 text-sm mb-2">{errors.email.msg}</p>
          )}
          <label
            htmlFor="mobile"
            className="mt-5 text-sm text-gray-600 dark:text-gray-200 tracking-wider normal-case"
          >
            enter mobile no:
          </label>
          <input
            type="text"
            name="mobile"
            placeholder="+8801**********"
            value={formData.mobile}
            onChange={handleChange}
            className={`outline-none bg-gray-200 focus:bg-white dark:bg-gray-500 dark:focus:bg-gray-300 p-2 rounded my-1 ${
              errors.mobile ? "border border-red-500" : ""
            }`}
          />
          {errors.mobile && (
            <p className="text-red-400 text-sm mb-2">{errors.mobile.msg}</p>
          )}
          <label
            htmlFor="password"
            className="mt-5 text-sm text-gray-600 dark:text-gray-200 relative tracking-wider normal-case"
          >
            {" "}
            enter password:
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="must use both case,number, and symbol "
              value={formData.password}
              onChange={handleChange}
              className={`outline-none w-full bg-gray-200 focus:bg-white dark:bg-gray-500 dark:focus:bg-gray-300 p-2 rounded my-1 ${
                errors.password ? "border border-red-500" : ""
              }`}
            />
            {showPassword ? (
              <div
                onClick={() => {
                  setShowPassword(false);
                }}
                className="absolute right-3.5 top-9 text-gray-700"
              >
                {" "}
                <IoEyeOff />
              </div>
            ) : (
              <div
                onClick={() => {
                  setShowPassword(true);
                }}
                className="absolute right-3.5 top-9 text-gray-700"
              >
                {" "}
                <IoEye />
              </div>
            )}
          </label>
          {errors.password && (
            <p className="text-red-400 text-sm mb-2">{errors.password.msg}</p>
          )}
          <div className="mt-5 space-x-3">
            {" "}
            <p className="inline text-gray-600 dark:text-gray-200"> role:</p>
            <label className="text-sm text-gray-600 dark:text-gray-200 normal-case">
              <input
                className="h-2 w-2"
                onChange={handleRole}
                type="radio"
                name="role"
                value="user"
              />{" "}
              user{" "}
            </label>
            <label className="text-sm text-gray-600 dark:text-gray-200 normal-case">
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
          <p className="mt-5 text-gray-600 dark:text-gray-200 text-sm">
            avatar:
          </p>
          <label
            htmlFor="avatar"
            className={` bg-gray-200 mx-auto my-0 focus:bg-white  dark:bg-gray-500 dark:focus:bg-gray-300 rounded  cursor-pointer ${
              errors.avatar ? "border border-red-500" : ""
            }`}
          >
            {preview ? <IoSwapHorizontal /> : <IoAdd />}
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
          {/* Image preview */}
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-20 object-fill h-20 rounded-full  border mx-auto my-0 "
            />
          ) : (
            <IoPersonCircle className="text-[80px] mx-auto" />
          )}
          <div className="flex gap-4 justify-around mt-6">
            {isLoading ? (
              <ClipLoader
                color="gray"
                loading={true}
                size={25}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            ) : (
              <button
                type="submit"
                className="bg-blue-300 rounded flex items-center
             gap-2 p-2 px-6 hover:bg-cyan-200 ring ring-gray-500 ring-offset-0 capitalize"
              >
                <IoPersonAddSharp />
                Create
              </button>
            )}
            <button
              type="button"
              className="bg-red-300 rounded ring-gray-500 flex items-center gap-2 p-2
             px-6 hover:bg-red-200 ring ring-offset-0 capitalize"
              onClick={() => navigate("/users")}
            >
              <IoPersonRemoveSharp />
              Cancel
            </button>
          </div>
        </form>
        <div className="h-[10vh]"></div>
      </div>
    </>
  );
};

export default AddUser;
