const mongoose = require("mongoose");

const dailyCupReportSchema = new mongoose.Schema({
  Date: {
    type: Date,
    default: Date.now,
  },
  weather_state: {
    type: String,
    enum: ["hot", "cold", "windy", "down pour", "NA"],
    default: "NA",
  },
  operated_surface: {
    type: String,
    enum: ["soft", "firm", "slippery", "large rocks", "NA"],
    default: "NA",
  },

  track_motor_nuts: {
    type: String,
    enum: ["ok", "untightened", "cracked", "NA"],
    default: "NA",
  },
  track_wear_eval: {
    type: String,
    enum: ["ok", "worm", "broken", "NA"],
    default: "NA",
  },
  track_tension_eval: {
    type: String,
    enum: ["ok", "tight", "loose", "NA"],
    default: "NA",
  },
  engine_coolant_image_before: {
    type: String,
  },
  working_ground_image_before: {
    type: String,
  },
  tracks_image_before: {
    type: String,
  },
  engine_coolant_image_analyzed: {
    type: String,
  },
  working_ground_image_analyzed: {
    type: String,
  },
  tracks_image_analyzed: {
    type: String,
  },
  oil_level_eval: {
    type: String,
    enum: ["ok", "close to minimum", "below minimum", "NA"],
    default: "NA",
  },
  oil_leak_eval: {
    type: String,
    enum: ["ok", "oil droplets", "clear leak", "NA"],
    default: "NA",
  },
  coolant_level_eval: {
    type: String,
    enum: ["ok", "close to minimum", "below minimum", "NA"],
    default: "NA",
  },
  coolant_leak_eval: {
    type: String,
    enum: ["ok", "coolant droplets", "clear leak", "NA"],
    default: "NA",
  },
  abnormal_sounds: {
    type: String,
    enum: ["no", "possibly", "yes", "NA"],
    default: "NA",
  },
  abnormal_vibrations: {
    type: String,
    enum: ["no", "possibly", "yes", "NA"],
    default: "NA",
  },
  abnormal_smells: {
    type: String,
    enum: ["no", "possibly", "yes", "NA"],
    default: "NA",
  },
  anything_else: {
    type: String,
    default: "NA",
  },
});

const dailyCupReport = mongoose.model("DailyCupReport", dailyCupReportSchema);
module.exports = dailyCupReport;
