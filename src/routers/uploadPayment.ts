import { Router } from "express";
import { uploadPaymentcontroller } from "../controllers/uploadpayment.controller";
import { uploaderMulter } from "../middleware/uploader.multer";
import { jwtVerify } from "../middleware/jwt.verify";

const paymentRouter = Router()

paymentRouter.patch('/:orderId', uploaderMulter(['image'], 'memoryStorage').single('paymentProof'),jwtVerify, uploadPaymentcontroller);

export default paymentRouter;

