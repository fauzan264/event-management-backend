import { Request, Response } from "express";
import { updateEventOrganizerService } from "../services/event.organizer.service";

export const updateEventOrganizerController = async (req: Request, res: Response) => {
  const {
    company_name,
    email,
    phone_number,
    address,
    website_url,
    bank_account,
  } = req.body

  const { userId } = res.locals.payload

  const { eventOrganizerId } = req.params

  const bannerUrl = Array.isArray(req?.files)
    ? req.files
    : req.files
    ? (req.files as Record<string, Express.Multer.File[]>).banner_url || []
    : []

  const eventOrganizer = await updateEventOrganizerService({
    id: eventOrganizerId,
    companyName: company_name,
    email,
    phoneNumber: phone_number,
    address,
    websiteUrl: website_url,
    bankAccount: bank_account,
    bannerUrl,
    userId
  })

  return res.status(200).json({
    status: true,
    message: `Successfully update data event organizer '${eventOrganizerId}'`,
    data: eventOrganizer
  })
}