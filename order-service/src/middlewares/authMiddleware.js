import jwt from "jsonwebtoken";
import env from "../config/env.js";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        logger.warn("Invalid token!");
        return res.status(429).json({
          message: "Invalid token!",
          success: false,
        });
      }
      req.user = user;
      next();
    });
  } else {
    logger.warn("Access attempt without valid token!");
    return res.status(401).json({
      message: "Authentication required",
      success: false,
    });
  }
};

export default verifyToken;