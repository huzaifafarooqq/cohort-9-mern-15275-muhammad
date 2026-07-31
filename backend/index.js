require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI);

const express = require("express");
const cors = require("cors");
const app = express();

const jwt = require("jsonwebtoken");
const{ authenticateToken } = require("./utilities");

app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (req, res) => {
  res.json({ data: "hello" });
});



app.listen(8000);

module.exports = app;