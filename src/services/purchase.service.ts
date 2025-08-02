import { prisma } from "../db/connection";
import { PurchaseOrders } from "../generated/prisma";

export const purchaseOrderservice = async ({
  fullName,
  email,
  eventId,
  quantity,
  discountId,
  UserPointsId,
}: Omit<PurchaseOrders, 'id' |'price'|'finalPrice'| 'paymentProof' | 'orderStatus' | 'createdAt' | 'updatedAt' | 'expiredAt' | 'deletedAt'>) => {
  return await prisma.$transaction(async (tx) => {
    
    //Event Validation
    const event = await tx.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new Error("Event not found");
    }

    if (event.availableTicket < quantity) {
      throw new Error("Not enough tickets available.");
    }

    //Initial price
    const initPrice = event.price * quantity;

    //Discount Validation
    let discount = null;
    if (discountId) {
      discount = await tx.coupon.findUnique({ where: { id: discountId } });
      if (!discount) {
        throw new Error("Coupon is not valid or has expired.");
      }
    }

    //Point Validation
    let userPoint = null;
    if (UserPointsId) {
      userPoint = await tx.userPoint.findUnique({ where: { id: UserPointsId } });
      if (!userPoint || userPoint.expiredAt < new Date()) {
        throw new Error("User point is not valid or has expired.");
      }
    }

    //Count Final Price After Discount and Point Usage
    const discountValue = discount?.discountValue || 0;
    const pointUsed = userPoint?.points || 0;

    const priceAfterDiscount = initPrice * (1 - discountValue / 100);
    const calculatedFinalPrice = Math.max(priceAfterDiscount - pointUsed, 0);

    //ExpireAt
    const now = new Date();
    const expiredAt = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    //Create Order
    const order = await tx.purchaseOrders.create({
      data: {
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

    //Update Remaining Ticket
    const updatedEvent = await tx.event.update({
      where: { id: eventId },
      data: {
        availableTicket: {
          decrement: quantity,
        },
      },
    });

    return {
      order
    };
  });
};


  export const expiredOrderService = async () => {
    const now = new Date ()
    const expiredOrders = await prisma.purchaseOrders.findMany({
      where : {
        orderStatus : 'Waiting for payment',
        expiredAt : {lt:now},
        paymentProof : null
      }
    });

    for (const order of expiredOrders) {
      await prisma.$transaction(async (tx) => {
        await tx.purchaseOrders.update ({
          where : {id : order.id},
          data : {orderStatus : 'Expired'}
        });

        await tx.event.update ({
          where: {id:order.eventId},
          data : {
            availableTicket : {
              increment: order.quantity
            }
          }
        })
      })
    }
  }


