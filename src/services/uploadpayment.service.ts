import { UploadApiResponse } from "cloudinary";
import { cloudinaryUpload } from "../lib/cloudinary.upload";
import { prisma } from "../db/connection";

type UploadPaymentInput = {
  id: string;
  imageFile: Express.Multer.File;
};



export const uploadPaymentService = async ({ id, imageFile }: UploadPaymentInput) => {
  const uploadResult = await cloudinaryUpload(imageFile.buffer, "payment_proof") as UploadApiResponse;

  const imageUrl = uploadResult.secureUrl
  console.log("Cloudinary result:", uploadResult);


  const uploadPayment = await prisma.purchaseOrders.update({
    where: { id },
    data: {
      paymentProof: imageUrl,
      orderStatus: "Waiting for Admin Confirmation",
    },
  });

  return uploadPayment;
};
