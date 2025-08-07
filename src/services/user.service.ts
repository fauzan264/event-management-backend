import { DateTime } from "luxon";
import { prisma } from "../db/connection";
import { User } from "../generated/prisma";
import { cloudinaryUpload } from "../lib/cloudinary.upload";
import snakecaseKeys from "snakecase-keys";

interface IUpdateUserServiceProps
  extends Pick<
    User,
    "id" | "idCardNumber" | "fullName" | "dateOfBirth" | "email" | "phoneNumber"
  > {
  profilePictures: Express.Multer.File[];
}

type PhotoProfileUser = { imageUrl: string | undefined | null };

export const updateUserService = async ({
  id,
  idCardNumber,
  fullName,
  dateOfBirth,
  email,
  phoneNumber,
  profilePictures,
  userId,
}: IUpdateUserServiceProps & { userId: string }) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (user?.id != userId)
    throw {
      message: `Access denied. You do not have permission to modify this user.`,
      isExpose: true,
    };

  if (!user) throw { message: "User not found", isExpose: true };

  let updateProfilePicture: PhotoProfileUser[] = [];
  if (profilePictures.length) {
    const uploadProfilePicture = profilePictures.map(async (image) => {
      const res: any = await cloudinaryUpload(image?.buffer, "user");

      return { imageUrl: res.secureUrl };
    });

    updateProfilePicture = await Promise.all(uploadProfilePicture);
  } else {
    updateProfilePicture.push({ imageUrl: user?.profilePicture });
  }

  const request = {
    idCardNumber: idCardNumber ? idCardNumber : user.idCardNumber,
    fullName: fullName ? fullName : user.fullName,
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : user.dateOfBirth,
    email: email ? email : user.email,
    phoneNumber: phoneNumber ? phoneNumber : user.phoneNumber,
    profilePicture: updateProfilePicture[0]?.imageUrl
      ? updateProfilePicture[0]?.imageUrl
      : user.profilePicture,
  };

  const result = await prisma.user.update({
    data: request,
    where: {
      id,
    },
    omit: {
      id: true,
      password: true,
      referralCode: true,
      totalUserPoint: true,
      userRole: true,
      deletedAt: true,
    },
  });

  const formattedResponse = {
    ...result,
    dateOfBirth: DateTime.fromJSDate(result.dateOfBirth).toFormat("dd-MM-yyyy"),
    createdAt: DateTime.fromJSDate(result.createdAt)
      .setZone("Asia/Jakarta")
      .toISO(),
    updatedAt: DateTime.fromJSDate(result.updatedAt)
      .setZone("Asia/Jakarta")
      .toISO(),
  };

  return snakecaseKeys(formattedResponse);
};

export const getMyEventOrganizerService = async ({
  id,
  userId,
}: Pick<User, "id"> & { userId: string }) => {
  if (id != userId)
    throw {
      message:
        "Access denied. You do not have permission to view this event organizer.",
      isExpose: true,
    };

  const eventOrganizer = await prisma.eventOrganizer.findUnique({
    where: {
      userId: id,
    },
    omit: {
      deletedAt: true,
    },
  });

  if (!eventOrganizer)
    throw {
      message: "Your account is not registered as an event organizer.",
      isExpose: true,
    };

  const formattedResponse = {
    ...eventOrganizer,
    createdAt: DateTime.fromJSDate(eventOrganizer.createdAt)
      .setZone("Asia/Jakarta")
      .toISO(),
    updatedAt: DateTime.fromJSDate(eventOrganizer.updatedAt)
      .setZone("Asia/Jakarta")
      .toISO(),
  };

  return snakecaseKeys(eventOrganizer);
};
