
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authorization = req.headers.authorization || "";
    const bearerToken = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;
    const accessTokenHeader = req.headers.accesstoken || req.headers["access-token"];
    const token = bearerToken || accessTokenHeader;

    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({
        message: "No token"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired"
      });
    }

    res.status(401).json({
      message: "Unauthorized"
    });
  }
};

module.exports = authMiddleware;
