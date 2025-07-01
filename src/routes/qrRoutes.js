import { Router } from "express";
import {generateQRCode, scanQRCode} from "../controllers/qrcontroller.js"

const router = Router()

router.post("/generateqr", generateQRCode)
router.post("/scanqr", scanQRCode)

export default router;