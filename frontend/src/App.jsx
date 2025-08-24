// internal imports
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { io } from "socket.io-client";

//external imports
import NotFound from "./Pages/NotFound";
import Login from "./Pages/Login";
import Inbox from "./Pages/Inbox";
import Users from "./Pages/Users";
import Example from "./Pages/AddUser";
import UserInfo from "./Pages/UserInfo";
import fetchData from "./hooks/fetchData";
import SessionExpired from "./utilities/SessionExpired";
import AddUser from "./Pages/AddUser";
import Test from "./Pages/Test";
import useChatStore from "./stores/chatStore";
import PopUp from "./utilities/PopUp";
import Feed from "./Pages/Feed";
import DarkMode from "./utilities/DarkMode";
import AddPost from "./Pages/AddPost";
import MainNav from "./Layouts/MainNav";
import User from "./Pages/User";
import NoInternetBanner from "./utilities/NoInternetBanner";
import PostDetails from "./Pages/PostDetails";
import ImagePreview from "./Pages/ImagePreview";
import EditPost from "./Pages/EditPost";
import Friends from "./Pages/Friends";
import RequestedFriend from "./components/friends/RequestedFriend";
import FriendRequest from "./components/friends/FriendRequest";
import EditProfile from "./Pages/EditProfile";
import Notifications from "./Pages/Notifications";
import Notification from "./utilities/Notification";

//socket
const socket = io(import.meta.env.VITE_API_URL, {
  withCredentials: true,
});
const App = () => {
  const [showMessage, setShowMessage] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [msgTone, setMsgTone] = useState(new Audio("/messageTone.mp3"));
  const [notificationTone, setNotificationTone] = useState(
    new Audio("/preview.mp3")
  );
  //get users id from localstorage
  const user = JSON.parse(localStorage.getItem("userId"));
  //set pop up message for show
  const PopUpMsg = useChatStore((s) => s.popUpMessage);
  const notification = useChatStore((s) => s.notification);
  const setNewNotification = useChatStore((s) => s.setNotification);

  //set a situation for user and set user
  const [situation, setSituation] = useState({
    isLoggedIn: false,
    userData: null,
    error: null,
  });

  //set a loading for better management
  const [isLoading, setIsLoading] = useState(true);
  //setting the permission for audio
  useEffect(() => {
    msgTone
      .play()
      .then(() => msgTone.pause())
      .catch(() => {});

    notificationTone
      .play()
      .then(() => notificationTone.pause())
      .catch(() => {});
  }, []);

  //use useEffect to confirm that user is logged in or not
  useEffect(() => {
    //async func under useEffect for backend
    const loadData = async () => {
      //always use try-catch block
      try {
        //used hook for get the data of user
        const result = await fetchData(user?.value);
        //set the situation according to the result
        setSituation(result);
      } catch (error) {
        //set the situation to not logged in if the fetching not works or the localstorage is empty
        setSituation({
          isLoggedIn: false,
          userData: null,
          error: "Failed to fetch user data.",
        });
      } finally {
        //finally finish the loader
        setIsLoading(false);
      }
    };
    //if the localStorage have something then call the function otherwise do not call it
    if (user?.value) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [user?.value]);
  //another useEffect for pop up messages
  useEffect(() => {
    if (PopUpMsg) {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 1500);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [PopUpMsg]);
  //useEffect for notification sound
  useEffect(() => {
    let timer2;

    const handleNotification = (notificationObject) => {
      if (notificationObject.author.includes(user?.value)) {
        setShowNotification(true);

        notificationTone.play();
        setNewNotification(notificationObject);
      }
    };
    if (showNotification) {
      clearTimeout(timer2);
      timer2 = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    }

    socket.on("new_notification", handleNotification);

    return () => {
      clearTimeout(timer2);
      socket.off("new_notification", handleNotification);
    };
  }, [notification, user?.value]);

  // useEffect message notification sound
  useEffect(() => {
    const handleMessage = ({ data, updatedCon }) => {
      if (data.receiver.id === user?.value) {
        msgTone.play();
      }
    };

    socket.on("new_message", handleMessage);
    return () => socket.off("new_message", handleMessage);
  }, [user?.value]);
  //if the async functions are calling set the loader until it finished
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
    //wrap the whole app with browser router for routes
    <BrowserRouter>
      {/* Navbar on the top and pass user data into it */}
      <MainNav data={situation} />
      <NoInternetBanner />
      {/* <DarkMode /> */}
      {showMessage && <PopUp message={PopUpMsg} />}
      {showNotification && <Notification message={notification} />}

      {/* if user logged in then serve these route */}
      {situation.isLoggedIn && situation.userData && !situation.error ? (
        <Routes>
          <Route path="/login" element={<Login data={situation} />} />
          <Route path="/user-info/:userId" element={<UserInfo />} />
          <Route
            path="/post-details/:postId"
            element={<PostDetails data={situation.userData} />}
          />
          <Route
            path="/edit-post/:postId"
            element={<EditPost data={situation.userData} />}
          />
          <Route path="/image-preview" element={<ImagePreview />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/modal" element={<Example />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/test" element={<Test />} />
          <Route path="/" element={<Feed />} />
          <Route
            path="/notifications"
            element={<Notifications user={situation.userData} />}
          />
          <Route path="/user/:userId" element={<User />} />
          <Route
            path="/add-post"
            element={<AddPost user={situation.userData} />}
          />
          <Route
            path="/edit-profile"
            element={<EditProfile user={situation.userData} />}
          />
          <Route
            path="/friends"
            element={<Friends user={situation.userData} />}
          >
            <Route path="requested" element={<RequestedFriend />} />
            <Route path="friend-request" element={<FriendRequest />} />
          </Route>
          {situation.userData.role === "admin" && (
            <>
              {" "}
              <Route path="/users" element={<Users />} />
              <Route path="/add-user" element={<AddUser />} />
            </>
          )}
        </Routes>
      ) : (
        // and if the user not logged in then serve only these router
        <Routes>
          <Route path="/login" element={<Login data={situation} />} />
          <Route path="*" element={<SessionExpired data={situation.error} />} />
        </Routes>
      )}
    </BrowserRouter>
  );
};

//export the app component
export default App;
