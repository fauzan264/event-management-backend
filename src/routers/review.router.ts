import { Router } from "express";
import { reviewController } from "../controllers/review.controller";
import { jwtVerify } from "../middleware/jwt.verify";

const reviewRouter = Router()

reviewRouter.post(':eventId/review', jwtVerify, reviewController)

export default reviewRouter