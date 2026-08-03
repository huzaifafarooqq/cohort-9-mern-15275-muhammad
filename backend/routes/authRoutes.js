const express = require("express");
const {
  createAccount,
  login,
  getUser,
} = require("../controllers/authController");
const { authenticateToken } = require("../utilities");

const router = express.Router();

router.post("/create-account", createAccount);
router.post("/login", login);
router.get("/get-user", authenticateToken, getUser);

module.exports = router;