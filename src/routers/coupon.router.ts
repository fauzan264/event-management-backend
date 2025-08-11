import { Router } from "express";
import { createPromoController } from "../controllers/coupon.controller";
import { jwtVerify } from "../middleware/jwt.verify";

const couponRouter = Router();

couponRouter.post('/promo', jwtVerify, createPromoController);

export default couponRouter;
