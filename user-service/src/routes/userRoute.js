import express from "express";
import userController from "../controllers/userController.js";
import passport from "../middlewares/passport.js";
import generateTokens from "../utils/generateToken.js";
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/refresh-token", userController.refreshTokenUser);
router.post("/logout", userController.logout);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.URL_CLIENT}/login`,
  }),
  async (req, res) => {
    try {
      const user = req.user;
      const salt = await bcrypt.genSalt();
      const token = await bcrypt.hash(user._id.toString(), salt);
      const cacheKey = token;

      const { accessToken, refreshToken } = await generateTokens(user);

      await req.redisClient.setex(
        cacheKey,
        300,
        JSON.stringify({ accessToken, refreshToken })
      );

      res.redirect(`${process.env.URL_CLIENT}/loginGoogle/success/${token}`);
    } catch (error) {
      console.error("Error during Google login callback:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

router.post("/loginGoogleSuccess", userController.loginGoogleSuccess);

export default router;
