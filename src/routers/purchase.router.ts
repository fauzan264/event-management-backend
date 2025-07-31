import { Router } from "express";
import {purchaseOrderController} from '../controllers/purchase.controller'

const purchaseRouter = Router()

purchaseRouter.post('/:eventId/purchase-order', purchaseOrderController);

export default purchaseRouter;

