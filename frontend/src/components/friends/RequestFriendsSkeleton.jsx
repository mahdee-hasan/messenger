import React from "react";
import { IoPersonCircle } from "react-icons/io5";

const RequestFriendsSkeleton = () => {
  return (
    <div className="mb-12">
      <div className="h-7 w-40 bg-gray-200 rounded-md mb-6"></div>
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <IoPersonCircle className="text-[56px] text-gray-300" />
              <div className="h-5 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
              <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequestFriendsSkeleton;
