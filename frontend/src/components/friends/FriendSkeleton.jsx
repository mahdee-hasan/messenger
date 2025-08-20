import React from "react";
import { IoPersonCircle } from "react-icons/io5";

const FriendsSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 animate-pulse">
      {/* Top Nav Skeleton */}
      <div className="flex items-center justify-center gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 w-32 bg-gray-200 rounded-full"></div>
        ))}
      </div>

      {/* Friends List Skeleton */}
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

      {/* Suggested Friends Skeleton */}
      <div>
        <div className="h-7 w-56 bg-gray-200 rounded-md mb-6"></div>
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow p-5 flex items-center justify-between"
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
    </div>
  );
};

export default FriendsSkeleton;
