// controllers/inspectionRController.js
const DailyCupReport = require("../models/dailyCupModel");
const axios = require("axios");
const FormData = require("form-data");
const { uploadBufferToS3 } = require("../utils/s3handler");
const sharp = require("sharp");

const imageDirectory = "daily checkup images";

exports.createDailyCupReport = async (req, res) => {
  try {
    console.log("Request files:", req.files);

    if (
      !req.files ||
      (!req.files.working_ground_image_before)
    ) {
      throw new Error(
        "Please upload the image of working ground "
      );
    }

    // Upload initial images to S3
    let workingGroundImageBeforeUrl = "";
    if (req.files.working_ground_image_before) {
      workingGroundImageBeforeUrl = await uploadBufferToS3(
        req.files.working_ground_image_before[0].buffer,
        req.files.working_ground_image_before[0].originalname,
        imageDirectory
      );
    }

    // Create a new DailyCupReport document
    const dailyCupReport = new DailyCupReport({
      ...req.body,
      working_ground_image_before: workingGroundImageBeforeUrl,
    });

    await dailyCupReport.save();
    res.status(201).json(dailyCupReport);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.getDailyCupReportById = async (req, res) => {
  try {
    const dailyCupReport = await DailyCupReport.findById(req.params.id);
    if (!dailyCupReport) {
      return res.status(404).json({ error: "Daily Cup Report not found" });
    }
    res.json(dailyCupReport);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.getAllDailyCupReports = async (req, res) => {
  try {
    const dailyCupReport = await DailyCupReport.find();
    res.json(dailyCupReport);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};