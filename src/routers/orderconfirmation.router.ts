import { Router } from "express";
import { orderConfirmationController } from "../controllers/orderconfirmation.controller";


const orderConfirmationrouter = Router();

orderConfirmationrouter.patch("/:id/status", orderConfirmationController);

export default orderConfirmationrouter;
