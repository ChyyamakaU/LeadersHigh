"use strict";

const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/sendResponse");
const announcementService = require("../services/announcementService");

const createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await announcementService.createAnnouncement(
    req.user,
    req.body,
    req.ip
  );
  return sendResponse(res, 201, { announcement }, "Announcement created successfully.");
});

const getAnnouncements = asyncHandler(async (req, res) => {
  const result = await announcementService.getAnnouncements(req.user, req.query);
  return sendResponse(res, 200, result, "Announcements retrieved successfully.");
});

const getAnnouncementById = asyncHandler(async (req, res) => {
  const announcement = await announcementService.getAnnouncementById(
    req.user,
    req.params.id,
    req.ip
  );
  return sendResponse(res, 200, { announcement }, "Announcement retrieved successfully.");
});

const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await announcementService.updateAnnouncement(
    req.user,
    req.params.id,
    req.body,
    req.ip
  );
  return sendResponse(res, 200, { announcement }, "Announcement updated successfully.");
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
  const result = await announcementService.deleteAnnouncement(
    req.user,
    req.params.id,
    req.ip
  );
  return sendResponse(res, 200, result, "Announcement deleted successfully.");
});

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
};
