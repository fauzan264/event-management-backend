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

    // User Validation
    const user = await tx.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const fullName = user.fullName;
    const email = user.email;


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
    const orders = await tx.purchaseOrders.create({
      data: {
        userId,
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
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        event: {
          select: {
            id: true,
            eventName: true,
          },
        },
        discount: {
          select : {
            discountValue : true
          }
        },
        user_points: {
          select : {
            points : true
          }
        }
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
    if (orders.discountId) {
      await tx.coupon.update({
        where: { id: orders.discountId },
        data: {
          availableCoupon: {
            decrement: 1,
          },
        },
      });
    }

    //Decrement Point
    if (orders.UserPointsId) {
        const userPoint = await tx.userPoint.findUnique({
          where: { id: orders.UserPointsId }
        });
        if (userPoint) {
          const returnPoint = userPoint.points
          await tx.userPoint.update({
            where:{ id: orders.UserPointsId },
            data: {
              points : {
                decrement : returnPoint
              }
            }
          })
        }
      }

    return {
      orders,
    };
  });
};


export const getAllOrderService = async () => {
  const orders = await prisma.purchaseOrders.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      event: {
        select: {
          id: true,
          eventName: true,
        },
      },
      discount: {
        select: {
          discountValue: true,
        },
      },
      user_points: {
        select: {
          points: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders;
};

export const getOrderDetailService = async (orderId: string) => {
  const order = await prisma.purchaseOrders.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
        },
      },
      event: {
        select: {
          eventName: true,
        },
      },
      discount: {
        select: {
          discountValue: true,
        },
      },
      user_points: {
        select: {
          points: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  return {
    orderId: order.id,
    fullName: order.user.fullName,
    email: order.user.email,
    eventName: order.event.eventName,
    quantity: order.quantity,
    price: order.price,
    discountValue: order.discount?.discountValue || 0,
    userPointsUsed: order.user_points?.points || 0,
    finalPrice: order.finalPrice,
    orderStatus: order.orderStatus,
    paymentProof: order.paymentProof,
    expiredAt: order.expiredAt,
    createdAt: order.createdAt,
  };
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
