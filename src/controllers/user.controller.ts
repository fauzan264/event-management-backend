import { Request, Response } from "express";
import {
  getMyEventOrganizerService,
  getMyProfileService,
  updateUserService,
} from "../services/user.service";

export const updateUserController = async (req: Request, res: Response) => {
  const { id_card_number, full_name, date_of_birth, email, phone_number } =
    req.body;

  const { id } = req.params;

  const { userId } = res.locals.payload;

  const profilePictures = Array.isArray(req?.files)
    ? req.files
    : req.files
    ? (req.files as Record<string, Express.Multer.File[]>).profile_picture || []
    : [];

  const user = await updateUserService({
    id,
    idCardNumber: id_card_number,
    fullName: full_name,
    dateOfBirth: date_of_birth,
    email,
    phoneNumber: phone_number,
    profilePictures,
    userId,
  });

  return res.status(200).json({
    status: true,
    message: "User updated successfully.",
    data: user,
  });
};

export const getMyEventOrganizerController = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  const { userId } = res.locals.payload;

  const eventOrganizer = await getMyEventOrganizerService({ id, userId });

  return res.status(200).json({
    status: true,
    message: "Successfully fetched your event organizer data.",
    data: eventOrganizer,
  });
};

export const getMyUserController = async (req: Request, res: Response) => {
  const { userId } = res.locals.payload;

  const user = await getMyProfileService({ userId });

  res.status(200).json({
    status: true,
    message: "Successfully fetched your profile.",
    data: user,
  });
};

function useAuthStore(): { token: any } {
  throw new Error("Function not implemented.");
}
