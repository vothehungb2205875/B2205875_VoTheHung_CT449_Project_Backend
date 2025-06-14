require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const passport = require("./app/config/passport");
const authRouter = require("./app/routes/auth.route");

const booksRouter = require("./app/routes/book.route.js");
const readersRouter = require("./app/routes/reader.route.js");
const publishersRouter = require("./app/routes/publisher.route.js");
const staffsRouter = require("./app/routes/staff.route.js");

const ApiError = require("./app/api-error.js");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3001",
    credentials: true,
  })
);

app.use(express.json());
app.use(passport.initialize());

// Static file for uploads
const uploadsPath = path.join(__dirname, "app", "uploads");
app.use("/uploads", express.static(uploadsPath));

// Routers
app.use("/api/books", booksRouter);
app.use("/api/readers", readersRouter);
app.use("/api/publishers", publishersRouter);
app.use("/api/staffs", staffsRouter);
app.use("/api/auth", authRouter); // ✅ Đăng nhập Google

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the Library Backend!");
});

// 404 Handler
app.use((req, res, next) => {
  return next(new ApiError(404, "Resource not found"));
});

// Global Error Handler
app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
