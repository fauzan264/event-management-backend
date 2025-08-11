import { DateTime } from "luxon";
import { prisma } from "../db/connection"
import { Coupon } from "../generated/prisma"
import snakecaseKeys from "snakecase-keys";

export const couponPromoService = async ({
    discountValue,
    provider_type,
    providerId,
    description,
    availableCoupon,
    startDate,
    endDate,
    eventId

}: Omit<Coupon, 'id'| 'createdAt' | 'updatedAt' | 'deletedAt'> ) => {
    const promo = await prisma.coupon.create({
        data : {
            discountValue,
            provider_type,
            providerId,
            description,
            availableCoupon,
            eventId,
            startDate : startDate ? new Date(startDate) : undefined,
            endDate : endDate ? new Date(endDate) : undefined,
        }
        
    })

    const formattedResponse = {
        ...promo,
        createdAt: DateTime.fromJSDate(promo.createdAt)
          .setZone("Asia/Jakarta")
          .toISO(),
        updatedAt: DateTime.fromJSDate(promo.updatedAt)
          .setZone("Asia/Jakarta")
          .toISO(),
      };
    
      return snakecaseKeys(formattedResponse);
}

export const getCouponbyEventService = async ({
    eventId
} : Pick <Coupon, 'eventId'>) => {
    const promo = await prisma.coupon.findMany ({
        where : {
            eventId
        }
    })

    return promo;
}