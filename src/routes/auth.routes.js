import { Router } from "express";
import {login, logout, profile, register, forgotpassword, recoverypassword} from '../controllers/auth.controller.js'
import {authRequired} from '../middlewares/validartoken.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/forgotpassword', forgotpassword)
router.put('/recoverypassword', recoverypassword)
router.post('/logout', logout)
router.get('/profile', authRequired, profile)

export default router