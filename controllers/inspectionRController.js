// controllers/inspectionRController.js
const InspectionReport = require("../models/inspectionReportModel");
const axios = require("axios");
const FormData = require("form-data");
const { uploadBufferToS3 } = require("../utils/s3handler");

const imageDirectory = "inspection images";

const prepareImageForm = (file) => {
  const form = new FormData();
  form.append("image", file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });
  return form;
};

// Function to call the external image detection service
const detectImage = async (imageForm) => {
  try {
    const response = await axios.post(
      "http://localhost:5000/v1/inspection/best",
      imageForm,
      {
        headers: { ...imageForm.getHeaders() },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error during image detection:", error.message);
    throw new Error("Image detection service failed");
  }
};

// Function to process the image, detect objects and upload to S3
const processImage = async (file, prefix = "") => {
  const url = await uploadBufferToS3(
    file.buffer,
    file.originalname,
    imageDirectory
  );
  const imageForm = prepareImageForm(file);
  const response = await detectImage(imageForm);
  const base64Image = response.image.split(",")[1];
  if (!base64Image) throw new Error("Invalid base64 image data");
  const analyzedImageBuffer = Buffer.from(base64Image, "base64");
  const analyzedUrl = await uploadBufferToS3(
    analyzedImageBuffer,
    `${prefix}${file.originalname}`,
    imageDirectory
  );
  return {
    url,
    analyzedUrl,
    prediction: response.prediction[0]?.name || "Unknown",
  };
};

// Controller to create an inspection report
exports.createInspectionReport = async (req, res) => {
  try {
    const files = req.files;
    if (
      !files ||
      (!files.radiator_image_before && !files.coolant_image_before)
    ) {
      return res
        .status(400)
        .json({
          error:
            "Please upload at least one image: radiator or coolant image for analysis.",
        });
    }

    const promises = [];
    const results = {};

    if (files.radiator_image_before) {
      promises.push(
        processImage(files.radiator_image_before[0], "analyzed_radiator_").then(
          (data) => {
            results.radiator = data;
          }
        )
      );
    }
    if (files.coolant_image_before) {
      promises.push(
        processImage(files.coolant_image_before[0], "analyzed_coolant_").then(
          (data) => {
            results.coolant = data;
          }
        )
      );
    }

    await Promise.all(promises);

    const extraImageUrl = files.extra_image
      ? await uploadBufferToS3(
          files.extra_image[0].buffer,
          files.extra_image[0].originalname,
          imageDirectory
        )
      : null;

<<<<<<< HEAD
    const inspectionReportData = {
      ...req.body,
      radiator_image_before: results.radiator?.url || "",
      coolant_image_before: results.coolant?.url || "",
      radiator_image_analyzed: results.radiator?.analyzedUrl || "",
      coolant_image_analyzed: results.coolant?.analyzedUrl || "",
      extra_image: extraImageUrl || null,
      Analysed_radiator_label: results.radiator?.prediction || "Unknown",
      Analysed_coolant_label: results.coolant?.prediction || "Unknown",
=======
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
        "http://137.184.185.56:5000/v1/inspection/best",
        imageForm,
        {
          headers: {
            ...imageForm.getHeaders(),
          },
          responseType: "arraybuffer", // Ensure response is in binary format for images
        }
      );
>>>>>>> 63f6b4ade8476d6ddb0a0b2ad328faae564fd9cb
    };

    const inspectionReport = new InspectionReport(inspectionReportData);
    await inspectionReport.save();
    res.status(201).json(inspectionReport);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// Controller to get all inspection reports
exports.getAllInspectionReports = async (req, res) => {
  try {
    const inspectionReports = await InspectionReport.find();
    res.status(200).json(inspectionReports);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// Controller to get an inspection report by ID
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
