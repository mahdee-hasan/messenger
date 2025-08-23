import PageTitle from "@/utilities/PageTitle";
import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 text-center">
      {/* 404 Big Text */}
      <PageTitle title=" ! page not found - social_box application" />
      <h1 className="text-9xl font-extrabold text-gray-300 tracking-widest select-none">
        404
      </h1>

      {/* Overlay label */}
      <div className="bg-indigo-600 text-white px-3 py-1 text-sm rounded rotate-12 absolute mt-[-3rem]">
        Page Not Found
      </div>

      {/* Message */}
      <p className="mt-8 text-lg text-gray-600">
        Sorry, we couldn't find the page you're looking for.
      </p>

      {/* Home Button */}
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow transition"
      >
        <FaArrowLeft />
        Go Back Home
      </Link>
    </div>
  );
}
