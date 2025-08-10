import { Router } from "express";
import { createPromoController } from "../controllers/coupon.controller";

const couponRouter = Router()

couponRouter.post('/promo', createPromoController)

export default couponRouter;