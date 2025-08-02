import { Router } from "express";
import { uploadPaymentcontroller } from "../controllers/uploadpayment.controller";
import { uploaderMulter } from "../middleware/uploader.multer";

const paymentRouter = Router()

paymentRouter.patch('/:id', uploaderMulter(['image'], 'memoryStorage').single('paymentProof'), uploadPaymentcontroller);

export default paymentRouter;

