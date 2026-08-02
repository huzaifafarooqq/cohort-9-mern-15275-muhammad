const logger = require("../logger");

const errorHandler = (err, req, res, next) => {
  logger.error(err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    error: true,
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;