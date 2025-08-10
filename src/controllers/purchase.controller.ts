import { Request, Response } from "express"
import { expiredOrderService, getAllOrderService,  getOrderbyUserIdService, getOrderDetailService, purchaseOrderservice } from "../services/purchase.service";
import { eventNames } from "process";


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

    const { orders } = newOrder;

    const formattedOrder = {
    id: orders?.id,
    user: orders?.user,
    event: orders?.event,
    quantity: orders?.quantity,
    price: orders?.price,
    discountValue: orders?.discount?.discountValue,
    userPoints: orders?.user_points?.points || 0,
    finalPrice: orders?.finalPrice,
    paymentProof: orders?.paymentProof,
    orderStatus: orders?.orderStatus,
    expiredAt: orders?.expiredAt,
    };


    res.status(201).json ({
        success:true,
        message: 'Purchese Order Successful',
        data : formattedOrder
    })
}

export const getAllOrderController = async (req: Request, res: Response) => {
  const {userId} = res.locals.payload;
  
  const orders = await getAllOrderService();

  const formattedOrders = orders.map((order) => ({
    id: order.id,
    userId : order.userId,
    fullName: order.fullName,
    email: order.email,
    eventName: order.event?.eventName,
    quantity: order.quantity,
    finalPrice: order.finalPrice,
    orderStatus: order.orderStatus,
    createdAt: order.createdAt.toISOString(), 
  }));
  console.log(JSON.stringify(orders, null, 2));


  res.status(200).json({
    success: true,
    message: "All orders retrieved successfully",
    data: formattedOrders,
  });
};

export const getOrderbyUserIdController = async (req: Request, res: Response)  => {
  const {userId} = res.locals.payload;
  const orders = await getOrderbyUserIdService (userId)
 

  const allOrders = orders.map((order) => ({
    id : order.id,
    imageUrl : order.event.image_url,
    eventName: order.event.event_name,
    startDate: order.event.start_date,
    endDate: order.event.end_date,
    quantity : order.quantity,
    finalPrice : order.final_price,
    orderStatus : order.order_status,
    createdAt : order.created_at
    
    
  }))

  res.status(200).json({
      success: true,
      message: "Order by user retrieved successfully",
      data: allOrders,
    });
}

export const getOrderDetailController = async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const orderDetail = await getOrderDetailService(orderId)

    res.status(200).json({
      success: true,
      message: "Order detail retrieved successfully",
      data: orderDetail,
    });
}

export const expiredOrdersController = async (req:Request, res:Response) => {

    await expiredOrderService();

    res.status(200).json ({
        success:true,
        message: 'Purchase Orders Expired'
    })
}