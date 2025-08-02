import { Request, Response } from "express";
import { orderConfirmationService } from "../services/orderconfirmation.service";


export const orderConfirmationController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { orderStatus } = req.body;

  if (!["Done", "Rejected"].includes(orderStatus)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order status. Use 'Done' or 'Rejected'.",
    });
  }

  const updated = await orderConfirmationService({ id, orderStatus });

  return res.status(200).json({
    success: true,
    message: `Order updated to '${orderStatus}'`,
    data: updated,
  });
};
