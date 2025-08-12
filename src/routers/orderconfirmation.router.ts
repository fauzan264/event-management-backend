import { Router } from "express";
import { orderConfirmationController } from "../controllers/orderconfirmation.controller";
import { jwtVerify } from "../middleware/jwt.verify";

const orderConfirmationRouter = Router();

orderConfirmationRouter.patch(
  "/:id/status",
  jwtVerify,
  orderConfirmationController
);

export default orderConfirmationRouter;
