import { Router } from "express";
import { reviewController } from "../controllers/review.controller";

const reviewRouter = Router()

reviewRouter.post(':eventId/review', reviewController)

export default reviewRouter