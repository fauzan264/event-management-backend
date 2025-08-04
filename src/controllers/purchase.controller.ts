import { Request, Response } from "express"
import { expiredOrderService, purchaseOrderservice } from "../services/purchase.service";


export const purchaseOrderController = async (req:Request, res:Response) => {
    const { eventId } = req.params;
    const {userId} = res.locals.payload;

    const {
        fullName,
        email,
        quantity,
        discountId,
        UserPointsId,
            } = req.body;

    const newOrder = await purchaseOrderservice ({
        userId,
        eventId,
        fullName,
        email,
        quantity,
        discountId,
        UserPointsId,
    })
    res.status(201).json ({
        success:true,
        message: 'Purchese Order Successful',
        data : newOrder.order
    })
}

export const expiredOrdersController = async (req:Request, res:Response) => {

    const expireOrders = await expiredOrderService();

    res.status(200).json ({
        success:true,
        message: 'Purchase Orders Expired'
    })
}