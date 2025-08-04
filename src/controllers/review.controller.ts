import { Request, Response } from "express";
import { reviewService } from "../services/review.service";

export const reviewController = async (req: Request, res: Response) => {
    const { userId } = res.locals.payload
    const {eventId} = req.params;
    const {rating, comment} = req.body;

    const review = await reviewService({
      userId,
      eventId,
      rating: Number(rating),
      comment,
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
}
