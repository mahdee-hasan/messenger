import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import NotFound from "./Pages/NotFound";
import Login from "./Pages/Login";
import Inbox from "./Pages/Inbox";
import Navbar from "./Layouts/Navbar";
import Users from "./Pages/Users";
import Example from "./Layouts/Modal";
import UserInfo from "./Pages/UserInfo";
import Home from "./Pages/Home";
import fetchData from "./hooks/fetchData";
import SessionExpired from "./components/SessionExpired";
import { ClipLoader } from "react-spinners";

const App = () => {
  const data = JSON.parse(localStorage.getItem("username"));
  const [situation, setSituation] = useState({
    isLoggedIn: false,
    userData: null,
    error: null,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchData(data?.value);
        setSituation(result);
      } catch (error) {
        setSituation({
          isLoggedIn: false,
          userData: null,
          error: "Failed to fetch user data.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (data?.value) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [data?.value]);

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

  return (
    <BrowserRouter>
      <Navbar data={situation} />
      {situation.isLoggedIn && situation.userData && !situation.error ? (
        <Routes>
          <Route path="/" element={<Home data={situation.userData} />} />
          <Route path="/login" element={<Login data={situation} />} />
          <Route path="/user-info/:username" element={<UserInfo />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/users" element={<Users />} />
          <Route path="/modal" element={<Example />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/login" element={<Login data={situation} />} />
          <Route path="*" element={<SessionExpired data={situation.error} />} />
        </Routes>
      )}
    </BrowserRouter>
  );
};

export default App;
