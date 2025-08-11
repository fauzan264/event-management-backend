import { Request, Response } from "express";
import { couponPromoService, getCouponbyEventService } from "../services/coupon.service";
import { prisma } from "../db/connection";

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
    discountValue: Number(discountValue),
    provider_type,
    providerId,
    description,
    availableCoupon,
    eventId,
    startDate,
    endDate,
  });

  res.status(201).json({
    success: true,
    data: newPromo,
    message: "Promo created successfully",
  });
};

export const getCouponbyEventController = async (req: Request, res: Response) => {
  const {eventId} = req.params

  const promolist = await getCouponbyEventService({eventId})
  console.log(promolist)
  console.log(eventId)

  res.status(201).json({
    success: true,
    data: promolist,
    message: "Promo list retrived successfully",
  });
}