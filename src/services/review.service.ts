import { prisma } from "../db/connection";

export const reviewService = async ({
  userId,
  eventId,
  rating,
  comment,
}: {
  userId: string;
  eventId: string;
  rating: number;
  comment: string;
}) => {
  return await prisma.$transaction(async (tx) => {
    //Event Validation
    const event = await tx.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    //Testimoni
    const testimoni = await tx.testimoni.create({
      data: {
        userId,
        eventId,
        rating,
        comment,
      },
    });
    return testimoni;
  });
};
