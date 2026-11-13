"use strict";

const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");

// All announcement routes require authentication
router.use(authenticate);

// Principal, staff, and prefects can create announcements
// Students can only view
router.post("/", authorize("principal", "staff", "prefect"), createAnnouncement);
router.get("/", authorize("principal", "staff", "prefect", "student"), getAnnouncements);
router.get("/:id", authorize("principal", "staff", "prefect", "student"), getAnnouncementById);
router.patch("/:id", authorize("principal", "staff", "prefect"), updateAnnouncement);
router.delete("/:id", authorize("principal", "staff", "prefect"), deleteAnnouncement);

module.exports = router;
