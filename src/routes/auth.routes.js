import { Router } from "express";
import {login, logout, profile, register,verifyAccount, recoverypassword, forgotpassword, resetpassword} from "../controllers/auth.controller.js";
import { authRequired } from "../middlewares/validartoken.js";

const router = Router();
router.post('/register', register)
router.post('/login', login)
router.post('/forgotpassword', forgotpassword)
router.put('/recoverypassword', recoverypassword)
router.post('/resetpassword', resetpassword)
router.post('/logout', logout)
router.get('/profile', authRequired, profile)
router.post("/verify", verifyAccount);

export default router;

