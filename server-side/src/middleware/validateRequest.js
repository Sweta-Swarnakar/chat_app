const validateRequest = (validator) => (req, res, next) => {
  const errors = validator(req);

  if (errors.length > 0) {
    return res.status(400).json({
      message: errors[0],
      errors
    });
  }

  return next();
};

module.exports = validateRequest;
