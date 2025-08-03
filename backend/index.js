// external imports
const dotenv = require("dotenv");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

// internal imports
const { connectDB } = require("./config/db");
const people = require("./models/people");
const {
  errorHandler,
  notFoundHandler,
} = require("./middleware/common/errorHandler");
const loginRouter = require("./router/loginRouter");
const inboxRouter = require("./router/inboxRouter");
const usersRouter = require("./router/usersRouter");
const feedsRouter = require("./router/feedsRouter");
const userRouter = require("./router/userRouter");
const conversation = require("./models/conversation");

// config

dotenv.config();

// app
const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  "http://localhost:5173", // local dev
  "https://messenger-project.netlify.app", // deployed frontend
];

// CORS for HTTP routes
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// CORS for socket.io
const io = require("socket.io")(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

global.io = io;
// connect to MongoDB
connectDB();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser(process.env.COOKIE_SECRET));

// routes
app.use("/api/login", loginRouter);
app.use("/api/users", usersRouter);
app.use("/api/inbox", inboxRouter);
app.use("/api/feeds", feedsRouter);
app.use("/api/user", userRouter);

// error handling
app.use(notFoundHandler);
app.use(errorHandler);

io.on("connection", async (socket) => {
  const cookieHeader = socket.handshake.headers.cookie;

  if (cookieHeader?.includes("=")) {
    try {
      const token = decodeURIComponent(cookieHeader.split("=")[1])
        .replace(/^s:/, "")
        .split(".")
        .slice(0, 3)
        .join(".");

      const userData = jwt.decode(token);
      const userId = userData?.userId;
      const username = userData.username;
      if (userId) {
        socket.userId = userId;
        socket.username = username;
        await people.updateOne({ _id: userId }, { $set: { active: true } });
      }
    } catch (err) {
      console.error("Token decode error:", err);
    }
  }

  socket.on("disconnect", async () => {
    try {
      if (socket.userId) {
        await people.updateOne(
          { _id: socket.userId },
          { $set: { active: false } }
        );
      }
      if (socket.username) {
        await conversation.updateMany(
          { isOpen: socket.username },
          { $pull: { isOpen: socket.username } }
        );
      }
    } catch (err) {
      console.error("Disconnect error:", err);
    }
  });
});

// listen
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
