// controllers/inspectionRController.js
const InspectionReport = require("../models/inspectionReportModel");
const axios = require("axios");
const FormData = require("form-data");
const { uploadBufferToS3 } = require("../utils/s3handler");

const imageDirectory = "inspection images";

exports.createInspectionReport = async (req, res) => {
  try {
    // Check if at least one required file exists in req.files
    if (
      !req.files ||
      (!req.files.radiator_image_before && !req.files.belt_image_before)
    ) {
      throw new Error(
        "Please upload at least one image: radiator or belt image for analysis."
      );
    }

    // Upload initial images to S3
    let radiatorImageBeforeUrl = "";
    if (req.files.radiator_image_before) {
      radiatorImageBeforeUrl = await uploadBufferToS3(
        req.files.radiator_image_before[0].buffer,
        req.files.radiator_image_before[0].originalname,
        imageDirectory
      );
    }
    let beltImageBeforeUrl = "";
    if (req.files.belt_image_before) {
      beltImageBeforeUrl = await uploadBufferToS3(
        req.files.belt_image_before[0].buffer,
        req.files.belt_image_before[0].originalname,
        imageDirectory
      );
    }

    // Check if extra image exists before uploading
    let extraImageUrl;
    if (req.files.extra_image) {
      extraImageUrl = await uploadBufferToS3(
        req.files.extra_image[0].buffer,
        req.files.extra_image[0].originalname,
        imageDirectory
      );
    }

    // Use the uploaded image URL for analysis
    let radiatorImageForm;
    if (req.files.radiator_image_before) {
      radiatorImageForm = new FormData();
      radiatorImageForm.append(
        "image",
        req.files.radiator_image_before[0].buffer,
        {
          filename: req.files.radiator_image_before[0].originalname,
          contentType: req.files.radiator_image_before[0].mimetype,
        }
      );
    }

    let beltImageForm;
    if (req.files.belt_image_before) {
      beltImageForm = new FormData();
      beltImageForm.append("image", req.files.belt_image_before[0].buffer, {
        filename: req.files.belt_image_before[0].originalname,
        contentType: req.files.belt_image_before[0].mimetype,
      });
    }

    const detectImage = async (imageForm) => {
      return await axios.post(
        "http://localhost:8000/v1/inspection/best",
        imageForm,
        {
          headers: {
            ...imageForm.getHeaders(),
          },
          responseType: "arraybuffer", // Ensure response is in binary format for images
        }
      );
    };

    // Array to hold the promises for image analysis
    const analysisPromises = [];
    if (radiatorImageForm) {
      analysisPromises.push(detectImage(radiatorImageForm));
    }
    if (beltImageForm) {
      analysisPromises.push(detectImage(beltImageForm));
    }

    const responses = await Promise.all(analysisPromises);

    let analyzedRadiatorUrl = "";
    let analyzedBeltUrl = "";
    if (radiatorImageForm) {
      const analyzedRadiatorImageBuffer = Buffer.from(
        responses[0].data,
        "binary"
      );
      analyzedRadiatorUrl = await uploadBufferToS3(
        analyzedRadiatorImageBuffer,
        `analyzed_${req.files.radiator_image_before[0].originalname}`,
        imageDirectory
      );
    }
    if (beltImageForm) {
      const beltResponseIndex = radiatorImageForm ? 1 : 0;
      const analyzedBeltImageBuffer = Buffer.from(
        responses[beltResponseIndex].data,
        "binary"
      );
      analyzedBeltUrl = await uploadBufferToS3(
        analyzedBeltImageBuffer,
        `analyzed_${req.files.belt_image_before[0].originalname}`,
        imageDirectory
      );
    }

    const inspectionReport = new InspectionReport({
      ...req.body,
      radiator_image_before: radiatorImageBeforeUrl,
      belt_image_before: beltImageBeforeUrl,
      radiator_image_analyzed: analyzedRadiatorUrl,
      belt_image_analyzed: analyzedBeltUrl,
      extra_image: extraImageUrl || null, // Ensure extra_image is set to null if not provided
    });

    await inspectionReport.save();
    res.status(201).json(inspectionReport);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.getAllInspectionReports = async (req, res) => {
  try {
    const inspectionReports = await InspectionReport.find();
    res.status(200).json(inspectionReports);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.getInspectionReportById = async (req, res) => {
  try {
    const inspectionReport = await InspectionReport.findById(req.params.id);
    if (!inspectionReport) {
      throw new Error("Inspection report not found");
    }
    res.status(200).json(inspectionReport);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};