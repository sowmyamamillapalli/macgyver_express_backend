// Configure AWS SDK
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

exports.uploadBufferToS3 = async (buffer, fileName, imageDirectory) => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${imageDirectory}/${Date.now()}_${fileName}`,
      Body: buffer,
      ContentType: "image/jpeg",
    };

    const data = await s3.upload(params).promise();
    return data.Location;
  } catch (error) {
    console.error(`Error uploading buffer to S3: ${error.message}`);
    throw error;
  }
};
