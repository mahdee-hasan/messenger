import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
const NotFound = () => {
  const [message, setMessage] = useState("");
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/notfound`, {
      credentials: "include",
    })
      .then((res) => res.text())
      .then((data) => setMessage(data));
  }, []);
  return (
    <>
      <Helmet>
        <title></title>
      </Helmet>
      <div>
        <p className="text-2xl text-red-300 text-center">{message}</p>
      </div>
    </>
  );
};

export default NotFound;
