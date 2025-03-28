import jwt from "jsonwebtoken";
import RefreshToken from "../models/refreshToken.js";

const generateTokens = async (user) => {
  const accessToken = jwt.sign(
    {
      userId: user._id,
      username: user.username,
    },
    env.ACCESS_TOKEN_SECRET,
    { expiresIn: "60m" }
  );

  const refreshToken = jwt.sign(
    {
      userId: user._id,
      username: user.username,
    },
    env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt,
  });

  return { accessToken, refreshToken };
};

export default generateTokens;
