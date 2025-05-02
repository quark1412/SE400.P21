import RefreshToken from "../models/refreshToken.js";
import User from "../models/user.js";
import generateTokens from "../utils/generateToken.js";
import logger from "../utils/logger.js";

const signup = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    let user = await User.findOne({ $or: [{ email }, { username }] });

    if (user && user.password) {
      logger.warn("User already exists");
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    if (user) {
      logger.info("User saved successfully", user._id);
      const { accessToken, refreshToken } = await generateTokens(user);
      user.password = password;
      await user.save();
      return res.status(201).json({
        success: true,
        message: "User registered successfully!",
        accessToken,
        refreshToken,
      });
    }

    user = new User({ username, email, password });
    await user.save();
    logger.info("User saved successfully", user._id);

    const { accessToken, refreshToken } = await generateTokens(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      accessToken,
      refreshToken,
    });
  } catch (e) {
    logger.error("Registration error occurred", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (!user) {
      logger.warn("Invalid user");
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      logger.warn("Invalid password");
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    res.status(200).json({
      accessToken,
      refreshToken,
      userId: user._id,
    });
    logger.info("User logged in successfully", user._id);
  } catch (e) {
    logger.error("Login error occurred", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const refreshTokenUser = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("Refresh token missing");
      return res.status(400).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken) {
      logger.warn("Invalid refresh token provided");
      return res.status(400).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    if (!storedToken || storedToken.expiresAt < new Date()) {
      logger.warn("Invalid or expired refresh token");

      return res.status(401).json({
        success: false,
        message: `Invalid or expired refresh token`,
      });
    }

    const user = await User.findById(storedToken.user);

    if (!user) {
      logger.warn("User not found");

      return res.status(401).json({
        success: false,
        message: `User not found`,
      });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateTokens(user);

    await RefreshToken.deleteOne({ _id: storedToken._id });

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
    logger.info("User refreshed successfully", user._id);
  } catch (e) {
    logger.error("Refresh token error occurred", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("Refresh token missing");
      return res.status(400).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    const storedToken = await RefreshToken.findOneAndDelete({
      token: refreshToken,
    });
    if (!storedToken) {
      logger.warn("Invalid refresh token provided");
      return res.status(400).json({
        success: false,
        message: "Invalid refresh token",
      });
    }
    logger.info("Refresh token deleted for logout");

    res.status(200).json({
      success: true,
      message: "Logged out successfully!",
    });
  } catch (e) {
    logger.error("Error while logging out", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const loginGoogleSuccess = async (req, res, next) => {
  try {
    const token = req.body.token;
    const data = await req.redisClient.get(token);

    if (!data) {
      logger.warn("Token expired!");
      return res.status(403).json({
        message: "Token expired!",
      });
    }

    logger.info("Xác thực token thành công!");
    return res.status(200).json({ data: JSON.parse(data) });
  } catch (error) {
    logger.error("Error during Google login success", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default {
  signup,
  login,
  refreshTokenUser,
  logout,
  loginGoogleSuccess,
};
