require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");

const logger = require("./logger");
const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");

if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      logger.info("Connected to MongoDB");
    })
    .catch((error) => {
      logger.error(error, "MongoDB connection failed");
    });
}

const app = express();

app.use(express.json());

app.use(requestLogger);

app.use(
  cors({
    origin: "*",
  }),
);

app.use(authRoutes);
app.use(noteRoutes);

app.get("/", (req, res) => {
  logger.info("Home route accessed");

  res.json({
    data: "hello",
  });
});

app.use(errorHandler);

const PORT = 8000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

module.exports = app;