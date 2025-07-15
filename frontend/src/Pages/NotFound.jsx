// internal imports
import React, { useEffect, useState } from "react";

import PageTitle from "../components/PageTitle";

const NotFound = () => {
  const [message, setMessage] = useState("");
  // make a fake request which will be return as not found page
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/notfound`, {
      credentials: "include",
    })
      .then((res) => res.text()) //catch the message and show it
      .then((data) => setMessage(data));
  }, []);
  return (
    <>
      <PageTitle title="notfound" />
      <div>
        <p className="text-2xl text-red-300 text-center">{message}</p>
      </div>
    </>
  );
};

export default NotFound;
