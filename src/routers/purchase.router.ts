import { Router } from "express";
import {expiredOrdersController, purchaseOrderController} from '../controllers/purchase.controller'
import { jwtVerify } from "../middleware/jwt.verify";

const purchaseRouter = Router()

purchaseRouter.post('/:eventId', jwtVerify, purchaseOrderController);
purchaseRouter.patch('/:eventId', expiredOrdersController);

export default purchaseRouter;

