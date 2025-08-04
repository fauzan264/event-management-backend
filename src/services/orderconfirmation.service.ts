import { prisma } from "../db/connection";

type OrderConfirmationInput = {
  id: string;
  orderStatus: "Done" | "Rejected" | "Cancelled";
};

export const orderConfirmationService = async ({
  id,
  orderStatus,
}: OrderConfirmationInput) => {
  const existingOrder = await prisma.purchaseOrders.findUnique({
    where: { id },
  });

  if (!existingOrder) {
    throw new Error("Order not found");
  }

  if (existingOrder.orderStatus !== "Waiting for Admin Confirmation") {
    throw new Error("Order cannot be confirmed. Status is not 'Waiting for Admin Confirmation'");
  }

  let finalStatus = orderStatus;
    if (["Done", "Rejected"].includes(orderStatus)) {
    finalStatus = orderStatus;
  } else {
    finalStatus = "Cancelled";
  }

  const updatedOrder = await prisma.purchaseOrders.update({
    where: { id },
    data: {
      orderStatus : finalStatus,
    },
  });
  return updatedOrder;
};
