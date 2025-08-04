import { prisma } from "../db/connection";
import { PurchaseOrders } from "../generated/prisma";
import { DateTime } from "luxon";

export const purchaseOrderservice = async ({
  userId,
  fullName,
  email,
  eventId,
  quantity,
  discountId,
  UserPointsId,
}: Omit<
  PurchaseOrders,
  | "id"
  | "price"
  | "finalPrice"
  | "paymentProof"
  | "orderStatus"
  | "createdAt"
  | "updatedAt"
  | "expiredAt"
  | "deletedAt"
> & { userId: string }) => {
  return await prisma.$transaction(async (tx) => {
    // Event Validation
    const event = await tx.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    if (event.availableTicket < quantity) {
      throw new Error("Not enough tickets available.");
    }

    // Initial price
    const initPrice = event.price * quantity;

    // Discount Validation
    let discount = null;
    if (discountId) {
      discount = await tx.coupon.findUnique({ where: { id: discountId } });
      if (!discount) {
        throw new Error("Coupon is not valid or has expired.");
      }
    }

    // Point Validation
    let userPoint = null;
    if (UserPointsId) {
      userPoint = await tx.userPoint.findUnique({ where: { id: UserPointsId } });
      if (!userPoint || userPoint.expiredAt < new Date()) {
        throw new Error("User point is not valid or has expired.");
      }
    }

    // Final Price
    const discountValue = discount?.discountValue || 0;
    const pointUsed = userPoint?.points || 0;
    const priceAfterDiscount = initPrice * (1 - discountValue / 100);
    const calculatedFinalPrice = Math.max(priceAfterDiscount - pointUsed, 0);

    // ExpireAt
    const now = DateTime.now().setZone("Asia/Jakarta");
    const expiredAt = now.plus({ hours: 2 }).toJSDate();

    // Create Order
    const order = await tx.purchaseOrders.create({
      data: {
        userId, // <- Tambahkan userId ke dalam order
        eventId,
        fullName,
        email,
        quantity,
        price: initPrice,
        discountId,
        UserPointsId,
        finalPrice: calculatedFinalPrice,
        orderStatus: "Waiting for payment",
        expiredAt,
      },
      include: {
        event: {
          select: {
            id: true,
            eventName: true,
            availableTicket: true,
          },
        },
      },
    });

    // Update Remaining Ticket
    await tx.event.update({
      where: { id: eventId },
      data: {
        availableTicket: {
          decrement: quantity,
        },
      },
    });

    // Decrement availableCoupon if used
    if (order.discountId) {
      await tx.coupon.update({
        where: { id: order.discountId },
        data: {
          availableCoupon: {
            decrement: 1,
          },
        },
      });
    }

    //Decrement Point
    if (order.UserPointsId) {
        const userPoint = await tx.userPoint.findUnique({
          where: { id: order.UserPointsId }
        });
        if (userPoint) {
          const returnPoint = userPoint.points
          await tx.userPoint.update({
            where:{ id: order.UserPointsId },
            data: {
              points : {
                decrement : returnPoint
              }
            }
          })
        }
      }

    return {
      order,
    };
  });
};

export const expiredOrderService = async () => {
  const now = new Date();
  const expiredOrders = await prisma.purchaseOrders.findMany({
    where: {
      orderStatus: "Waiting for payment",
      expiredAt: { lt: now },
      paymentProof: null,
    },
  });

  for (const order of expiredOrders) {
    await prisma.$transaction(async (tx) => {
      await tx.purchaseOrders.update({
        where: { id: order.id },
        data: { orderStatus: "Expired" },
      });

      await tx.event.update({
        where: { id: order.eventId },
        data: {
          availableTicket: {
            increment: order.quantity,
          },
        },
      });

      if (order.discountId) {
        await tx.coupon.update({
          where: { id: order.discountId },
          data: {
            availableCoupon: {
              increment: 1,
            },
          },
        });
      }

      if (order.UserPointsId) {
        const userPoint = await tx.userPoint.findUnique({
          where: { id: order.UserPointsId }
        });
        if (userPoint) {
          const returnPoint = userPoint.points
          await tx.userPoint.update({
            where:{ id: order.UserPointsId },
            data: {
              points : {
                increment : returnPoint
              }
            }
          })
        }
      }
    });
    

    const formatted = {
      ...order,
      createdAt: DateTime.fromJSDate(order.createdAt).setZone("Asia/Jakarta").toISO(),
      updatedAt: DateTime.fromJSDate(order.updatedAt).setZone("Asia/Jakarta").toISO(),
      expiredAt: DateTime.fromJSDate(order.expiredAt).setZone("Asia/Jakarta").toISO(),
      deletedAt: order.deletedAt
        ? DateTime.fromJSDate(order.deletedAt).setZone("Asia/Jakarta").toISO()
        : null,
    };

    console.log(formatted);
  }
};
