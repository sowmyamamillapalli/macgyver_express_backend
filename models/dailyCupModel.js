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
  kind_of_operations: {
    type: String,
    enum: ["heavy", "light", "very deep", "high offloading", "NA"],
    default: "NA",
  },
  working_ground_image_before: {
    type: String,
  },
  check_coolant_level: {
    type: String,
    enum: ["ok", "close to minimum", "below minimum", "NA"],
    default: "NA",
  },
  was_coolant_refilled: {
    type: String,
    enum: ["yes", "no"],
    default: "no",
  },
 check_coolant_leaks: {
    type: String,
    enum: ["ok", "coolant droplets", "clear leak", "NA"],
    default: "NA",
  },
  abnormal_sounds: {
    type: String,
    enum: ["no", "possibly", "yes", "NA"],
    default: "NA",
  },
  anything_else: {
    type: String,
    default: "NO"
  }
});

const dailyCupReport = mongoose.model("DailyCupReport", dailyCupReportSchema);
module.exports = dailyCupReport;
