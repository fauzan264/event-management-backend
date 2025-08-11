import { Router } from "express";
import { createPromoController, getCouponbyEventController } from "../controllers/coupon.controller";
import { jwtVerify } from "../middleware/jwt.verify";

const couponRouter = Router();

couponRouter.post('/promo', jwtVerify, createPromoController);
couponRouter.get('/promo/:eventId', jwtVerify, getCouponbyEventController )

export default couponRouter;
