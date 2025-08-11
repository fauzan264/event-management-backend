import { prisma } from "../../db/connection";

export const cancelTransactionsJob = async () => {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);


  const expiredTransactions = await prisma.purchaseOrders.findMany({
    where: {
      orderStatus: "WAITING_FOR_ADMIN_CONFIRMATION",
      updatedAt: {
        lt: threeMonthsAgo,
      },
    },
  });

  for (const order of expiredTransactions) {
    await prisma.$transaction(async (tx) => {
  
      await tx.purchaseOrders.updateMany({
        where: { id: order.id },
        data: { orderStatus: "CANCELED" },
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

    console.log(`[CRON] Canceled and reverted order id: ${order.id}`);
  }
};
