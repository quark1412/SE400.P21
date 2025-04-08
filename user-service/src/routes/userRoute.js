import express from "express";
import userController from "../controllers/userController.js";
import passport from "../middlewares/passport.js";

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
    failureRedirect: `http://localhost:3000/login`,
  }),
  (req, res) => {
    res.status(200).json({ data: req.user });
  }
);

export default router;
