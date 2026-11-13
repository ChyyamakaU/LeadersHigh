"use strict";

const createApp = require("./app");

const PORT = parseInt(process.env.PORT, 10) || 5000;

createApp()
  .then((app) => {
    app.listen(PORT, () => {
      console.log(`[Server] Running on port ${PORT} (${process.env.NODE_ENV})`);
    });
  })
  .catch((error) => {
    console.error("[Server] Failed to start:", error.message);
    process.exit(1);
  });

process.on("unhandledRejection", (reason) => {
  console.error("[Server] Unhandled Rejection:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("[Server] Uncaught Exception:", error.message);
  process.exit(1);
});
