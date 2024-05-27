const mongoose = require("mongoose");

const inspectionReportSchema = new mongoose.Schema({
  Date: {
    type: Date,
    default: Date.now,
  },
  radiator_cleanliness: {
    type: String,
    enum: ["clean", "dirty", "damaged", "undamaged", "NA"],
    default: "NA",
  },
  check_coolant_level: {
    type: String,
    enum: ["ok", "close to minimum", "below minimum", "NA"],
    default: "NA",
  },
  check_fan_blades_wear: {
    type: String,
    enum: ["ok", "worn", "damaged", "NA"],
    default: "NA",
  },
  check_fan_function: {
    type: String,
    enum: ["good", "poor airflow", "fan not spinning", "NA"],
    default: "NA",
  },
  coolant_leaks: {
    type: String,
    enum: ["ok", "coolant droplets", "clear leak", "NA"],
    default: "NA",
  },
  odd_water_pump_sound: {
    type: String,
    enum: ["no", "possibly", "yes", "NA"],
    default: "NA",
  },
  fan_spinning_correctly: {
    type: String,
    enum: ["ok", "coolant droplets", "clear leak", "NA"],
    default: "NA",
  },
  Analysed_coolant_label: {
    type: String,
    default: "NA",
  },
  Analysed_radiator_label: {
    type: String,
    default: "NA",
  },
  radiator_image_before: {
    type: String,
  },
  coolant_image_before: {
    type: String,
  },
  radiator_image_analyzed: {
    type: String,
  },
  coolant_image_analyzed: {
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
