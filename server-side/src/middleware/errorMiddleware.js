const ApiError = require("../errors/ApiError");

const errorMiddleware = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
      details: err.details || undefined
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: err.message
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid identifier"
    });
  }

  console.error(err);
  return res.status(500).json({
    message: "Internal server error"
  });
};

module.exports = errorMiddleware;
