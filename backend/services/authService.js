const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const registerUser = async ({ fullName, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return {
      userExists: true,
    };
  }

  const user = new User({
    fullName,
    email,
    password,
  });

  await user.save();

  const accessToken = jwt.sign(
    {
      user: {
        _id: user._id,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "36000m",
    },
  );

  return {
    userExists: false,
    user,
    accessToken,
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    return {
      status: "not-found",
    };
  }

  if (user.email !== email || user.password !== password) {
    return {
      status: "invalid",
    };
  }

  const accessToken = jwt.sign(
    {
      user: {
        _id: user._id,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "36000m",
    },
  );

  return {
    status: "success",
    user,
    accessToken,
  };
};

const getUserById = async (userId) => {
  return User.findOne({ _id: userId });
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
};
