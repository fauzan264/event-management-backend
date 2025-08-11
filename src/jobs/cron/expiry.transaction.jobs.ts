import { prisma } from "../../db/connection";

export const expiryTransactionsJob = async () => {
  const now = new Date();

 
  const expiredOrders = await prisma.purchaseOrders.findMany({
    where: {
      paymentProof: null,
      expiredAt: { lt: now },
      orderStatus: "WAITING_FOR_ADMIN_CONFIRMATION", 
    },
  });

  for (const order of expiredOrders) {
    await prisma.$transaction(async (tx) => {
      await tx.purchaseOrders.update({
        where: { id: order.id },
        data: { orderStatus: 'EXPIRED' },
      });

      // Return Seat
      await tx.event.update({
        where: { id: order.eventId },
        data: {
          availableTicket: {
            increment: order.quantity,
          },
        },
      });

      // Return Coupon Used
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

      // Return User Point
      if (order.UserPointsId) {
        const userPoint = await tx.userPoint.findUnique({
          where: { id: order.UserPointsId },
        });

        if (userPoint) {
          await tx.userPoint.update({
            where: { id: order.UserPointsId },
            data: {
              points: {
                increment: userPoint.points,
              },
            },
          });
        }
      }
    });

    console.log(`[CRON] Expired and reverted order id: ${order.id}`);
  }
};
