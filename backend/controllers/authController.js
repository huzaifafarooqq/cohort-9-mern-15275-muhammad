const logger = require("../logger");
const {
  registerUser,
  loginUser,
  getUserById,
} = require("../services/authService");

const createAccount = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName) {
      return res.status(400).json({
        error: true,
        message: "Full Name is required",
      });
    }

    if (!email) {
      return res.status(400).json({
        error: true,
        message: "Email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        error: true,
        message: "Password is required",
      });
    }

    const result = await registerUser({
      fullName,
      email,
      password,
    });

    if (result.userExists) {
      return res.json({
        error: true,
        message: "User already exist",
      });
    }

    logger.info("New user registered successfully");

    return res.json({
      error: false,
      user: {
        _id: result.user._id,
        fullName: result.user.fullName,
        email: result.user.email,
      },
      accessToken: result.accessToken,
      message: "Registration Successful",
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    const result = await loginUser({
      email,
      password,
    });

    if (result.status === "not-found" || result.status === "invalid") {
      return res.status(400).json({
        error: true,
        message: "Invalid email or password",
      });
    }

    logger.info("User logged in successfully");

    return res.json({
      error: false,
      message: "Login Successful",
      email,
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const { user } = req.user;

    const existingUser = await getUserById(user._id);

    if (!existingUser) {
      return res.sendStatus(401);
    }

    return res.json({
      user: {
        fullName: existingUser.fullName,
        email: existingUser.email,
        _id: existingUser._id,
        createdOn: existingUser.createdOn,
      },
      message: "",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAccount,
  login,
  getUser,
};
