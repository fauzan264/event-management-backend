import { PurchaseOrders } from "../generated/prisma";
import { prisma } from "../db/connection";

type OrderConfirmationInput = {
  id: string;
  orderStatus: "Done" | "Rejected";

};


export const orderConfirmationService = async ({
    id, orderStatus
}: OrderConfirmationInput) => {
    const updatedOrder = await prisma.purchaseOrders.update({
    where: { id },
    data: {
      orderStatus,
    },
  });

  return updatedOrder
}