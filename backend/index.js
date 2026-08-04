require("dotenv").config();

const dns = require("dns");

const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");

const logger = require("./logger");
const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");

const dnsServers = process.env.DNS_SERVERS?.split(",")
  .map((server) => server.trim())
  .filter(Boolean);

if (dnsServers?.length) {
  dns.setServers(dnsServers);
}

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

app.disable("x-powered-by");

app.use(express.json());

app.use(requestLogger);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
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
