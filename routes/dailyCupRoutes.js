// routes/inspectionReportRoutes.js
const express = require("express");
const multer = require("multer");
const {
  createDailyCupReport,
  getAllDailyCupReports,
  getDailyCupReportById,
} = require("../controllers/dailyCupController");

// Configure multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.post(
  "/create-daily-checkup-report",
  upload.fields([
    { name: "working_ground_image_before", maxCount: 1 },
  ]),
  createDailyCupReport
);

router.get("/checkup-reports", getAllDailyCupReports);

router.get("/checkup-report/:id", getDailyCupReportById);

module.exports = router;
