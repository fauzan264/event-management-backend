import { Request, Response } from "express"
import { purchaseOrderservice } from "../services/purchase.service";


export const purchaseOrderController = async (req:Request, res:Response) => {
    const { eventId } = req.params;

    const {
        fullName,
        email,
        quantity,
        price,
        discountId,
        UserPointsId,
        finalPrice,
            } = req.body;

const newOrder = await purchaseOrderservice ({
    eventId,
    fullName,
    email,
    quantity,
    price,
    discountId,
    UserPointsId,
    finalPrice
})
    res.status(201).json ({
        success:true,
        message: 'Purchese Order Successful',
        data : newOrder
    })
}