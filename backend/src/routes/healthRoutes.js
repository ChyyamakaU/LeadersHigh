"use strict";

const express = require("express");
const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ success: true, statusCode: 200, message: "Server is healthy", data: null });
});

module.exports = router;
