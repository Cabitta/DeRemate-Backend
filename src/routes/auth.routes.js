import { Router } from "express";
import {
  login,
  logout,
  profile,
  register,
  verifyAccount,
  recoverypassword,
  forgotpassword,
  resetpassword,
  refreshToken,
} from "../controllers/auth.controller.js";
import { authRequired } from "../middlewares/validartoken.js";
import passport from "passport";

const router = Router();

// Rutas sin autenticación
router.post("/register", register);
router.post(
  "/login",
  passport.authenticate("login", { session: false }),
  login
);
router.post("/refresh-token", refreshToken);
router.post("/forgotpassword", forgotpassword);
router.put("/recoverypassword", recoverypassword);
router.post("/resetpassword", resetpassword);
router.post("/logout", logout);
router.post("/verify", verifyAccount);

// Rutas protegidas con JWT
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  profile
);

export default router;
