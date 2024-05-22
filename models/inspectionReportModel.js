const mongoose = require("mongoose");

const inspectionReportSchema = new mongoose.Schema({
  Date: {
    type: Date,
    default: Date.now,
  },
  radiator_cleanliness: {
    type: String,
    enum: ["clean", "dirty", "very dirty", "NA"],
    default: "NA",
  },
  radiator_bent_fins: {
    type: String,
    enum: ["ok", "few bends", "very bent", "NA"],
    default: "NA",
  },
  tightness_of_belts: {
    type: String,
    enum: ["ok", "loose", "worn", "NA"],
    default: "NA",
  },
  rolling_bearings: {
    type: String,
    enum: ["ok", "some resistance", "catching", "NA"],
    default: "NA",
  },
  coolant_leaks: {
    type: String,
    enum: ["ok", "coolant droplets", "clear leak", "NA"],
    default: "NA",
  },
  odd_water_pump_sound: {
    type: String,
    enum: ["No", "possibly", "yes", "NA"],
    default: "NA",
  },
  fan_spinning_correctly: {
    type: String,
    enum: ["ok", "coolant droplets", "clear leak", "NA"],
    default: "NA",
  },
  radiator_image_before: {
    type: String
  },
  belt_image_before: {
    type: String
  },
  radiator_image_analyzed: {
    type: String,
  },
  belt_image_analyzed: {
    type: String,
  },
  extra_image: {
    type: String,
  },
});

const InspectionReport = mongoose.model(
  "InspectionReport",
  inspectionReportSchema
);
module.exports = InspectionReport;
