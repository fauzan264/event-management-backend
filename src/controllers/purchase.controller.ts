import { Request, Response } from "express"
import { purchaseOrderservice } from "../services/purchase.service";


export const purchaseOrderController = async (req:Request, res:Response) => {
    const {
        fullName,
        email,
        eventId,
        quantity,
        price,
        discountId,
        UserPointsId,
        finalPrice,
        orderStatus
            } = req.body;

const newOrder = await purchaseOrderservice ({
    fullName,
    email,
    eventId,
    quantity,
    price,
    discountId,
    UserPointsId,
    finalPrice,
    orderStatus,

})
    res.status(201).json ({
        success:true,
        message: 'Purchese Order Successful',
        data : newOrder
    })
}