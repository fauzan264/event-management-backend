import { Router } from "express";
import {expiredOrdersController, purchaseOrderController} from '../controllers/purchase.controller'

const purchaseRouter = Router()

purchaseRouter.post('/:eventId', purchaseOrderController);
purchaseRouter.patch('/:eventId', expiredOrdersController);

export default purchaseRouter;

