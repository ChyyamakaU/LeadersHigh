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
const {
  createAnnouncementValidators,
  updateAnnouncementValidators,
  announcementIdParamValidators,
  listAnnouncementsValidators,
  validate,
} = require("../validators/announcementValidators");

// All announcement routes require authentication
router.use(authenticate);

// Principal, staff, and prefects can create announcements
// Students can only view
router.post("/", authorize("principal", "staff", "prefect"), createAnnouncementValidators, validate, createAnnouncement);
router.get("/", authorize("principal", "staff", "prefect", "student"), listAnnouncementsValidators, validate, getAnnouncements);
router.get("/:id", authorize("principal", "staff", "prefect", "student"), announcementIdParamValidators, validate, getAnnouncementById);
router.patch("/:id", authorize("principal", "staff", "prefect"), announcementIdParamValidators, updateAnnouncementValidators, validate, updateAnnouncement);
router.delete("/:id", authorize("principal", "staff", "prefect"), announcementIdParamValidators, validate, deleteAnnouncement);

module.exports = router;
