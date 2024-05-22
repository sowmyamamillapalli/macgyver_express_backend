// routes/externalApi.js
const express = require("express");
const multer = require("multer");
const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const upload = multer({ dest: "uploads/" });

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Route to upload image to S3
router.post("/uploadImage", upload.single("image"), (req, res) => {
  const fileContent = fs.readFileSync(req.file.path);
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: path.basename(req.file.path), // File name you want to save as in S3
    Body: fileContent,
    ContentType: req.file.mimetype,
  };

  s3.upload(params, (err, data) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      fs.unlinkSync(req.file.path); // Delete the file from local server
      res.status(200).json({
        message: "Image successfully uploaded to S3",
        data: data.Location,
      });
    }
  });
});

module.exports = router;
