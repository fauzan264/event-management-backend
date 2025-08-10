import { Router } from "express";
import {getAllOrderController, getOrderbyUserIdController, getOrderDetailController, purchaseOrderController} from '../controllers/purchase.controller'
import { jwtVerify } from "../middleware/jwt.verify";


const purchaseRouter = Router()

purchaseRouter.get('/orders', getAllOrderController);
purchaseRouter.get('/orders/:userId', jwtVerify, getOrderbyUserIdController);
purchaseRouter.get('/:orderId', getOrderDetailController);
purchaseRouter.post('/:eventId', jwtVerify, purchaseOrderController);



export default purchaseRouter;

