// routes/inspectionReportRoutes.js
const express = require("express");
const multer = require("multer");
const {
  createInspectionReport,
  getAllInspectionReports,
  getInspectionReportById,
} = require("../controllers/inspectionRController");

// Configure multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.post(
  "/create-inspection-report",
  upload.fields([
    { name: "radiator_image_before", maxCount: 1 },
    { name: "coolant_image_before", maxCount: 1 },
    { name: "extra_image", maxCount: 1 },
  ]),
  createInspectionReport
);

router.get("/inpection-reports", getAllInspectionReports);

router.get("/inspection-report/:id", getInspectionReportById);

module.exports = router;