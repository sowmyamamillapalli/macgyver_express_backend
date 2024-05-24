// controllers/inspectionRController.js
const DailyCupReport = require("../models/dailyCupModel");
const axios = require("axios");
const FormData = require("form-data");
const { uploadBufferToS3 } = require("../utils/s3handler");
const sharp = require("sharp");

const imageDirectory = "daily checkup images";

async function preprocessImage(buffer) {
  const resizedBuffer = await sharp(buffer)
    .resize(542, 542) // Resize to expected dimensions
    .toBuffer();
  return resizedBuffer;
}

exports.createDailyCupReport = async (req, res) => {
  try {
    console.log("Request files:", req.files);

    if (
      !req.files ||
      (!req.files.tracks_image_before &&
        !req.files.engine_coolant_image_before &&
        !req.files.working_ground_image_before)
    ) {
      throw new Error(
        "Please upload at least one image: tracks, engine coolant, or working ground images for analysis."
      );
    }

    // Upload initial images to S3
    let tracksImageBeforeUrl = "";
    if (req.files.tracks_image_before) {
      tracksImageBeforeUrl = await uploadBufferToS3(
        req.files.tracks_image_before[0].buffer,
        req.files.tracks_image_before[0].originalname,
        imageDirectory
      );
    }
    let engineCoolantImageBeforeUrl = "";
    if (req.files.engine_coolant_image_before) {
      engineCoolantImageBeforeUrl = await uploadBufferToS3(
        req.files.engine_coolant_image_before[0].buffer,
        req.files.engine_coolant_image_before[0].originalname,
        imageDirectory
      );
    }
    let workingGroundImageBeforeUrl = "";
    if (req.files.working_ground_image_before) {
      workingGroundImageBeforeUrl = await uploadBufferToS3(
        req.files.working_ground_image_before[0].buffer,
        req.files.working_ground_image_before[0].originalname,
        imageDirectory
      );
    }

    // Preprocess images before uploading and analysis
    let tracksImageBuffer;
    if (req.files.tracks_image_before) {
      tracksImageBuffer = await preprocessImage(
        req.files.tracks_image_before[0].buffer
      );
    }
    let engineCoolantImageBuffer;
    if (req.files.engine_coolant_image_before) {
      engineCoolantImageBuffer = await preprocessImage(
        req.files.engine_coolant_image_before[0].buffer
      );
    }
    let workingGroundImageBuffer;
    if (req.files.working_ground_image_before) {
      workingGroundImageBuffer = await preprocessImage(
        req.files.working_ground_image_before[0].buffer
      );
    }

    const createImageForm = (buffer, originalname, mimetype) => {
      const form = new FormData();
      form.append("image", buffer, {
        filename: originalname,
        contentType: mimetype,
      });
      return form;
    };

    let tracksImageForm;
    if (tracksImageBuffer) {
      tracksImageForm = createImageForm(
        tracksImageBuffer,
        req.files.tracks_image_before[0].originalname,
        req.files.tracks_image_before[0].mimetype
      );
    }
    let engineCoolantForm;
    if (engineCoolantImageBuffer) {
      engineCoolantForm = createImageForm(
        engineCoolantImageBuffer,
        req.files.engine_coolant_image_before[0].originalname,
        req.files.engine_coolant_image_before[0].mimetype
      );
    }
    let workingGroundForm;
    if (workingGroundImageBuffer) {
      workingGroundForm = createImageForm(
        workingGroundImageBuffer,
        req.files.working_ground_image_before[0].originalname,
        req.files.working_ground_image_before[0].mimetype
      );
    }

    const detectImage = async (imageForm) => {
      const response = await axios.post(
        "http://137.184.185.56:5000/v1/dailycheckup/best",
        imageForm,
        {
          headers: imageForm.getHeaders(),
          responseType: "arraybuffer",
        }
      );
      return response;
    };

    // Array to hold the promises for image analysis
    const analysisPromises = [];
    if (tracksImageForm) {
      analysisPromises.push(detectImage(tracksImageForm));
    }
    if (engineCoolantForm) {
      analysisPromises.push(detectImage(engineCoolantForm));
    }
    if (workingGroundForm) {
      analysisPromises.push(detectImage(workingGroundForm));
    }

    const responses = await Promise.all(analysisPromises);

    let analyzedTracksUrl = "";
    let analyzedEngineUrl = "";
    let analyzedWorkingGroundUrl = "";
    if (tracksImageForm) {
      const analyzedTracksImageBuffer = Buffer.from(
        responses[0].data,
        "binary"
      );
      analyzedTracksUrl = await uploadBufferToS3(
        analyzedTracksImageBuffer,
        `analyzed_${req.files.tracks_image_before[0].originalname}`,
        imageDirectory
      );
    }
    if (engineCoolantForm) {
      const engineCoolantResponseIndex = tracksImageForm ? 1 : 0;
      const analyzedCoolantImageBuffer = Buffer.from(
        responses[engineCoolantResponseIndex].data,
        "binary"
      );
      analyzedEngineUrl = await uploadBufferToS3(
        analyzedCoolantImageBuffer,
        `analyzed_${req.files.engine_coolant_image_before[0].originalname}`,
        imageDirectory
      );
    }
    if (workingGroundForm) {
      const workingGroundResponseIndex =
        (tracksImageForm ? 1 : 0) + (engineCoolantForm ? 1 : 0);
      const analyzedWorkingGroundImageBuffer = Buffer.from(
        responses[workingGroundResponseIndex].data,
        "binary"
      );
      analyzedWorkingGroundUrl = await uploadBufferToS3(
        analyzedWorkingGroundImageBuffer,
        `analyzed_${req.files.working_ground_image_before[0].originalname}`,
        imageDirectory
      );
    }

    // Create a new DailyCupReport document
    const dailyCupReport = new DailyCupReport({
      ...req.body,
      tracks_image_before: tracksImageBeforeUrl,
      engine_coolant_image_before: engineCoolantImageBeforeUrl,
      working_ground_image_before: workingGroundImageBeforeUrl,
      tracks_image_analyzed: analyzedTracksUrl,
      engine_coolant_image_analyzed: analyzedEngineUrl,
      working_ground_image_analyzed: analyzedWorkingGroundUrl,
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
