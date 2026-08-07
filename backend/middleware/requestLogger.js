const logger = require("../logger");

const requestLogger = (req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);

  res.on("finish", () => {
    logger.info(
      `${req.method} ${req.originalUrl} ${res.statusCode}`,
    );
  });

  next();
};

module.exports = requestLogger;