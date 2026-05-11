import { Router } from "express";
import AuthController from "./auth.controllers.js";

const authController = new AuthController();

const router = Router();

router.post("/signup", authController.handleSignup.bind(authController));
router.post("/signin", authController.handleSignin.bind(authController));
router.post("/refresh", authController.handleRefreshToken.bind(authController));
router.post("/signout", authController.handleSignout.bind(authController));

export default router;