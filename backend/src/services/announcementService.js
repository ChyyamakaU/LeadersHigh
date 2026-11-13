"use strict";

const {
  User,
  StudentProfile,
  PrefectProfile,
  Class,
  Announcement,
} = require("../models/index");
const { Op } = require("sequelize");
const auditService = require("./auditService");
const AppError = require("../utils/AppError");

const ALLOWED_AUDIENCES = [
  "all",
  "principal",
  "staff",
  "prefect",
  "student",
  "class",
];

/**
 * Create a new announcement.
 * - Principal/staff: can create announcements for any audience
 * - Prefect: can create announcements for students/class only
 * - Students cannot create announcements
 */
async function createAnnouncement(actor, data, ipAddress) {
  const {
    title,
    content,
    targetAudience,
    classId,
  } = data;

  // Validate targetAudience
  if (!ALLOWED_AUDIENCES.includes(targetAudience)) {
    throw new AppError(
      `Invalid targetAudience. Must be one of: ${ALLOWED_AUDIENCES.join(", ")}`,
      400
    );
  }

  // Role-based restrictions
  if (actor.role === "student") {
    throw new AppError("Students cannot create announcements.", 403);
  }

  if (actor.role === "prefect") {
    // Prefects can only announce to students or their class
    if (!["student", "class"].includes(targetAudience)) {
      throw new AppError(
        "Prefects can only create announcements for students or their class.",
        403
      );
    }

    if (targetAudience === "class") {
      const prefectProfile = await PrefectProfile.findOne({
        where: { userId: actor.id },
        attributes: ["classId"],
      });
      if (!prefectProfile || !prefectProfile.classId) {
        throw new AppError("You are not assigned to a class.", 403);
      }
      data.classId = prefectProfile.classId;
    }
  }

  // If targeting a specific class, validate it exists
  if (classId) {
    const classRecord = await Class.findByPk(classId);
    if (!classRecord) {
      throw new AppError("Class not found.", 404);
    }
  }

  const announcement = await Announcement.create({
    title,
    content,
    createdBy: actor.id,
    targetAudience,
    classId: classId || null,
  });

  await auditService.log({
    userId: actor.id,
    action: "CREATE_ANNOUNCEMENT",
    entity: "Announcement",
    entityId: announcement.id,
    description: `${actor.role} created announcement: "${title}" for ${targetAudience}`,
    ipAddress,
  });

  return announcement;
}

/**
 * Check if an actor can view a given announcement.
 */
async function canViewAnnouncement(actor, announcement) {
  if (announcement.targetAudience === "all") {
    return true;
  }

  if (announcement.targetAudience === actor.role) {
    return true;
  }

  if (announcement.targetAudience === "class") {
    // Staff and principal can view class announcements
    if (["staff", "principal"].includes(actor.role)) {
      return true;
    }

    if (actor.role === "student") {
      const studentProfile = await StudentProfile.findOne({
        where: { userId: actor.id },
        attributes: ["classId"],
      });
      return studentProfile && studentProfile.classId === announcement.classId;
    }

    if (actor.role === "prefect") {
      const prefectProfile = await PrefectProfile.findOne({
        where: { userId: actor.id },
        attributes: ["classId"],
      });
      return prefectProfile && prefectProfile.classId === announcement.classId;
    }
  }

  return false;
}

/**
 * Get announcements with pagination, filtering.
 * Role-based visibility:
 * - "all": everyone sees it
 * - role-specific: only users with that role see it
 * - "class": only students/prefects in that class (and staff/principal)
 */
async function getAnnouncements(actor, {
  page = 1, limit = 20, targetAudience, classId,
}) {
  const where = {};

  // Build visibility conditions based on actor's role
  const visibilityConditions = ["all", actor.role];

  if (actor.role === "student") {
    const studentProfile = await StudentProfile.findOne({
      where: { userId: actor.id },
      attributes: ["classId"],
    });
    const studentClassId = studentProfile ? studentProfile.classId : null;

    where[Op.or] = [
      { targetAudience: { [Op.in]: ["all", "student"] } },
    ];
    if (studentClassId) {
      where[Op.or].push({ targetAudience: "class", classId: studentClassId });
    }
  } else if (actor.role === "prefect") {
    const prefectProfile = await PrefectProfile.findOne({
      where: { userId: actor.id },
      attributes: ["classId"],
    });
    const prefectClassId = prefectProfile ? prefectProfile.classId : null;

    where[Op.or] = [
      { targetAudience: { [Op.in]: ["all", "prefect"] } },
    ];
    if (prefectClassId) {
      where[Op.or].push({ targetAudience: "class", classId: prefectClassId });
    }
  } else {
    // staff and principal see all announcements (administrators)
    where.targetAudience = { [Op.in]: ALLOWED_AUDIENCES };
  }

  // Optional filter by targetAudience
  if (targetAudience) {
    if (!ALLOWED_AUDIENCES.includes(targetAudience)) {
      throw new AppError(`Invalid targetAudience.`, 400);
    }
    where.targetAudience = targetAudience;
  }

  // Optional filter by classId
  if (classId) {
    where.classId = classId;
  }

  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const parsedLimit = parseInt(limit, 10);

  const { count, rows: announcements } = await Announcement.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: "creator",
        attributes: ["id", "firstName", "lastName", "email"],
      },
      {
        model: Class,
        as: "targetClass",
        attributes: ["id", "name", "section"],
      },
    ],
    limit: parsedLimit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return {
    announcements,
    meta: {
      total: count,
      page: parseInt(page, 10),
      limit: parsedLimit,
      totalPages: Math.ceil(count / parsedLimit),
    },
  };
}

/**
 * Get a single announcement by ID.
 */
async function getAnnouncementById(actor, announcementId, ipAddress) {
  const announcement = await Announcement.findByPk(announcementId, {
    include: [
      {
        model: User,
        as: "creator",
        attributes: ["id", "firstName", "lastName", "email"],
      },
      {
        model: Class,
        as: "targetClass",
        attributes: ["id", "name", "section"],
      },
    ],
  });

  if (!announcement) {
    throw new AppError("Announcement not found.", 404);
  }

  const canView = await canViewAnnouncement(actor, announcement);
  if (!canView) {
    throw new AppError("You are not authorized to view this announcement.", 403);
  }

  return announcement;
}

/**
 * Update an announcement.
 * - Principal/staff: can update any announcement
 * - Prefect: can update only announcements they created
 * - Students cannot update announcements
 */
async function updateAnnouncement(actor, announcementId, data, ipAddress) {
  const announcement = await Announcement.findByPk(announcementId);
  if (!announcement) {
    throw new AppError("Announcement not found.", 404);
  }

  if (actor.role === "student") {
    throw new AppError("Students cannot modify announcements.", 403);
  }

  if (actor.role === "prefect" && announcement.createdBy !== actor.id) {
    throw new AppError(
      "You can only modify announcements you created.",
      403
    );
  }

  const updatableFields = ["title", "content", "targetAudience", "classId"];
  const changes = [];

  for (const field of updatableFields) {
    if (data[field] !== undefined && data[field] !== announcement[field]) {
      changes.push(`${field}: ${announcement[field]} -> ${data[field]}`);
      announcement[field] = data[field];
    }
  }

  await announcement.save();

  if (changes.length > 0) {
    await auditService.log({
      userId: actor.id,
      action: "UPDATE_ANNOUNCEMENT",
      entity: "Announcement",
      entityId: announcement.id,
      description: `${actor.role} updated announcement: "${announcement.title}"`,
      ipAddress,
    });
  }

  return announcement;
}

/**
 * Delete an announcement.
 * - Principal/staff: can delete any announcement
 * - Prefect: can delete only announcements they created
 * - Students cannot delete announcements
 */
async function deleteAnnouncement(actor, announcementId, ipAddress) {
  const announcement = await Announcement.findByPk(announcementId);
  if (!announcement) {
    throw new AppError("Announcement not found.", 404);
  }

  if (actor.role === "student") {
    throw new AppError("Students cannot delete announcements.", 403);
  }

  if (actor.role === "prefect" && announcement.createdBy !== actor.id) {
    throw new AppError(
      "You can only delete announcements you created.",
      403
    );
  }

  const title = announcement.title;
  await announcement.destroy();

  await auditService.log({
    userId: actor.id,
    action: "DELETE_ANNOUNCEMENT",
    entity: "Announcement",
    entityId: announcementId,
    description: `${actor.role} deleted announcement: "${title}"`,
    ipAddress,
  });

  return { message: "Announcement deleted successfully.", announcementId };
}

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  ALLOWED_AUDIENCES,
};
