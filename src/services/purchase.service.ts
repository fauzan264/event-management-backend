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
  finalPrice,
  orderStatus,
}: Omit<PurchaseOrders, 'id' | 'venueId' | 'paymentProff' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => {
  
}
