import { Router } from "express";
import { orderConfirmationController } from "../controllers/orderconfirmation.controller";


const orderConfirmationRouter = Router();

orderConfirmationRouter.patch("/:id/status", orderConfirmationController);

export default orderConfirmationRouter;
