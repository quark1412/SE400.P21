import express from "express";
import userController from "../controllers/userController.js";

const router = express.Router();

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/refresh-token", userController.refreshTokenUser);
router.post("/logout", userController.logout);

export default router;
