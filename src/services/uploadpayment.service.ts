import { UploadApiResponse } from "cloudinary";
import { cloudinaryUpload } from "../lib/cloudinary.upload";
import { prisma } from "../db/connection";

type UploadPaymentInput = {
  orderId: string;
  imageFile: Express.Multer.File;
};



export const uploadPaymentService = async ({ orderId, imageFile }: UploadPaymentInput) => {
  const uploadResult = await cloudinaryUpload(imageFile.buffer, "payment_proof") as UploadApiResponse;

  const imageUrl = uploadResult.secureUrl
  console.log("Cloudinary result:", uploadResult);


  const uploadPayment = await prisma.purchaseOrders.update({
    where: { id: orderId },
    data: {
      paymentProof: imageUrl,
      orderStatus: "Waiting for Admin Confirmation",
    },
  });

  return uploadPayment;
};
