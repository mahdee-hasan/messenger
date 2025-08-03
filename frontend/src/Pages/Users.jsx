// internal imports
import React, { useState, useEffect, useRef } from "react";
import { IoAddCircleSharp, IoTrash } from "react-icons/io5";
import { MdAdminPanelSettings } from "react-icons/md";
import { ClipLoader } from "react-spinners";
import { FaCircleUser } from "react-icons/fa6";

//external imports

import PageTitle from "../components/PageTitle";
import useChatStore from "../stores/chatStore";

const Users = () => {
  //useStates
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [deleting, setDeleting] = useState(null);

  //useEffect for load users
  useEffect(() => {
    loadUser();
  }, [deleting]);
  const setMsg = useChatStore((s) => s.setPopUpMessage);

  //async func for load users
  const loadUser = async () => {
    //send request by fetch api for load users
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        credentials: "include",
      });
      //take action according to response
      if (!res.ok) {
        throw new Error("something went wrong!");
      }
      const data = await res.json(); //format data
      if (Array.isArray(data.users)) {
        setUsers(data.users); //set User if its valid
      }
    } catch (error) {
      //take action if error occurred
      setMsg(error.message);
    } finally {
      //shut the loader down
      setIsLoading(false);
    }
  };

  //async func for delete the selected user
  const handleDeleteUser = async (id) => {
    setDeleting(id);
    try {
      //send request to backend for delete the user
      await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => setMsg(data.message)) //take action according to given response
        .catch((err) => {
          throw new Error(err.message); //throw error if happens
        });
    } catch (error) {
      //take action if error occurred
      setMsg(error.message);
    } finally {
      // shut the loader
      setDeleting(null);
    }
  };

  // return loader if loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ClipLoader
          color="gray"
          loading={true}
          size={100}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
    );
  }
  return (
    <div className="max-w-3xl mx-auto  h-[100vh] overflow-scroll scrollbar-hide">
      <PageTitle title="users - chat application" />
      <p className="text-xl text-center border-b shadow-2xl border-gray-300/50 h-14 p-3 ">
        users
      </p>
      <div className=" sticky z-40 border-b border-gray-400/50 bg-gray-100 dark:bg-gray-600 top-0">
        <button
          onClick={() => location.replace("/add-user")}
          className="hover:bg-gray-100 dark:hover:bg-gray-500 cursor-pointer flex justify-center w-full items-center h-14"
        >
          <IoAddCircleSharp className="text-2xl" />
        </button>
      </div>
      <div className="w-full p-3  dark:text-gray-200">
        <table className="w-full  scrollbar-hide">
          <thead>
            <tr
              className="border-b h-10 sticky text-gray-700 dark:text-gray-200 bg-gray-50
             dark:bg-gray-700 top-14 shadow-2xl px-2 border-b-gray-300/50"
            >
              <th className="text-sm text-center  w-[15%]">Avatar</th>
              <th className="text-center text-sm w-[35%]">Name</th>
              <th className="text-center text-sm w-[30%]">Email</th>
              <th className="w-[20%]">Action</th>
            </tr>
          </thead>
          <tbody className="">
            {users.map((user) => (
              <tr
                className="h-14 shadow-2xl cursor-pointer hover:underline"
                key={user._id}
                onClick={() => location.replace(`/user/${user._id}`)}
              >
                <td className="w-[15%] p-2 text-center">
                  {user.avatar ? (
                    <img
                      className="w-10 object-cover rounded-full dark:ring-gray-500 ring aspect-square"
                      src={user.avatar}
                      alt="avatar"
                    />
                  ) : (
                    <FaCircleUser className="text-[40px] " />
                  )}
                </td>
                <td className="text-center w-[35%] text-gray-600 dark:text-gray-200 font-bold ">
                  {user.name}
                </td>
                <td className="text-xs w-[30%] text-center text-gray-500 dark:text-gray-100 normal-case">
                  {user.email}
                </td>
                <td className="text-center w-[20%] text-red-400 ">
                  {user.role === "user" ? (
                    deleting === user._id ? (
                      <ClipLoader
                        color="gray"
                        loading={true}
                        size={20}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                      />
                    ) : (
                      <button
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteUser(user._id);
                        }}
                      >
                        <IoTrash />
                      </button>
                    )
                  ) : (
                    <MdAdminPanelSettings
                      className="mx-auto cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="h-70"></div>
    </div>
  );
};

// export the component
export default Users;
