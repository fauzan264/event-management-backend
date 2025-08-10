import { Request, Response } from "express";
import { couponPromoService } from "../services/coupon.service";

export const createPromoController = async (req: Request, res: Response) => {
  const {
    discountValue,
    provider_type,
    providerId,
    description,
    availableCoupon,
    eventId,
    startDate,
    endDate,
  } = req.body;

  const newPromo = await couponPromoService({
    discountValue,
    provider_type,
    providerId,
    description,
    availableCoupon,
    eventId,
    startDate,
    endDate
  });

  res.status(201).json({
    success: true,
    data: newPromo,
    message: "Promo created successfully",
  });
};
