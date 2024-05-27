// app.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const inspectionRoutes = require("./routes/inspectionRoutes");
const dailyCupRoutes = require("./routes/dailyCupRoutes");
const cors = require("cors");
const helmet = require("helmet");
//const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

console.log('MongoDB URI:', process.env.MONGODB_URI);

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(helmet());
//app.use(xss());
app.use(mongoSanitize());
const limiter = rateLimit({
  max: 60,
  windowMs: 30 * 60 * 1000,
  message: "Too many request , please try again after half hour!",
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/checkup", dailyCupRoutes);
app.use("/api/inspection", inspectionRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

// initial Route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
