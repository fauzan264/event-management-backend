import { Router } from "express";
import {purchaseOrderController} from '../controllers/purchase.controller'

const purchaseRouter = Router()

purchaseRouter.post('/purchase-order', purchaseOrderController);

export default purchaseRouter;

