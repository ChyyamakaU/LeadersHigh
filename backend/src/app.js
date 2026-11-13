"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { connectDB } = require("./config/database");
const { setupAssociations } = require("./models/associations");
const errorHandler = require("./middleware/errorHandler");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const principalRoutes = require("./routes/principalRoutes");
const staffRoutes = require("./routes/staffRoutes");
const prefectRoutes = require("./routes/prefectRoutes");
const studentRoutes = require("./routes/studentRoutes");
const taskRoutes = require("./routes/taskRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const healthRoutes = require("./routes/healthRoutes");

const app = express();

// Trust proxy (for IP address accuracy behind load balancers)
app.set("trust proxy", 1);

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Health check (no auth required)
app.use("/api/health", healthRoutes);

// Auth routes (public)
app.use("/api/auth", authRoutes);

// Protected API routes
app.use("/api/users", userRoutes);
app.use("/api/principal", principalRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/prefect", prefectRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/announcements", announcementRoutes);

// 404 handler for undefined routes
app.use((_req, _res, next) => {
  const err = new Error(`Route not found: ${_req.method} ${_req.originalUrl}`);
  err.statusCode = 404;
  err.isOperational = true;
  next(err);
});

// Centralized error handler
app.use(errorHandler);

// Initialize database and export app for testing
module.exports = async function createApp() {
  await connectDB();
  setupAssociations();
  return app;
};
