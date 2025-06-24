// external imports
const dotenv = require("dotenv");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// internal imports
const { connectDB } = require("./config/db");
const {
  errorHandler,
  notFoundHandler,
} = require("./middleware/common/errorHandler");
const loginRouter = require("./router/loginRouter");
const inboxRouter = require("./router/inboxRouter");
const usersRouter = require("./router/usersRouter");

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

// error handling
app.use(notFoundHandler);
app.use(errorHandler);

io.on("connection", (socket) => {
  socket.on("disconnect", () => {});
});

// listen
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
