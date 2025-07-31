import { prisma } from "../db/connection";
import { PurchaseOrders } from "../generated/prisma";
export const purchaseOrderservice = async ({
  fullName,
  email,
  eventId,
  quantity,
  price,
  discountId,
  UserPointsId,
  finalPrice
}: Omit<PurchaseOrders, 'id' | 'paymentProof' |'orderStatus'| 'createdAt' | 'updatedAt' | 'deletedAt'>) => {
    return await prisma.purchaseOrders.create ({
      data: {
        eventId,
        fullName,
        email,
        quantity,
        price,
        discountId,
        UserPointsId,
        finalPrice,
        orderStatus: 'Waiting for payment'
      }
    })
}
