import { Request, Response } from "express";
import { uploadPaymentService } from "../services/uploadpayment.service";

export const uploadPaymentcontroller = async (req: Request, res: Response) => {
  const { id } = req.params;
  const imageFile = req.file;

  if (!imageFile) {
  return res.status(400).json({
    success: false,
    message: "No image uploaded.",
  });
}

  await uploadPaymentService({ id, imageFile });
  console.log(imageFile)

  res.status(201).json({
    success: true,
    message: "Payment receipt successfully uploaded",
  });
};
