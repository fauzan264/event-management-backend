import snakecaseKeys from "snakecase-keys";
import { prisma } from "../db/connection";
import { Category, Event, EventOrganizer } from "../generated/prisma";
import { cloudinaryUpload } from "../lib/cloudinary.upload";
import { DateTime } from "luxon";
import { IGetAllEventServiceProps } from "../types/event";

interface IUpdateEventOrganizerServiceProps
  extends Omit<
    EventOrganizer,
    "bannerUrl" | "createdAt" | "updatedAt" | "deletedAt"
  > {
  bannerUrl?: Express.Multer.File[];
}

type Banner = { bannerUrl: string | undefined | null };

export const updateEventOrganizerService = async ({
  id,
  companyName,
  email,
  phoneNumber,
  address,
  websiteUrl,
  bankAccount,
  bannerUrl,
  userId,
}: IUpdateEventOrganizerServiceProps) => {
  const eventOrganizer = await prisma.eventOrganizer.findUnique({
    where: {
      id,
    },
  });

  if (!eventOrganizer)
    throw { message: `Event Organizer not found`, isExpose: true };

  if (eventOrganizer.userId != userId)
    throw {
      message: `Access denied. You do not have permission to modify this event organizer.`,
      isExpose: true,
    };

  let createBanner: Banner[] = [];
  if (bannerUrl?.length) {
    const uploadImage = bannerUrl.map(async (image) => {
      const { secureUrl } = (await cloudinaryUpload(
        image?.buffer,
        "banner_url"
      )) as { secureUrl: string | undefined };

      return { bannerUrl: secureUrl };
    });

    createBanner = await Promise.all(uploadImage);
  } else {
    if (eventOrganizer?.bannerUrl) {
      createBanner.push({ bannerUrl: eventOrganizer?.bannerUrl });
    } else {
      throw {
        message:
          "Banner image is required because it was not provided previously.",
        isExpose: true,
      };
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const request = {
      companyName: companyName ? companyName : eventOrganizer.companyName,
      email: email ? email : eventOrganizer.email,
      phoneNumber: phoneNumber ? phoneNumber : eventOrganizer.phoneNumber,
      address: address ? address : eventOrganizer.address,
      websiteUrl: websiteUrl ? websiteUrl : eventOrganizer.websiteUrl,
      bankAccount: bankAccount ? bankAccount : eventOrganizer.bankAccount,
      bannerUrl:
        createBanner[0]?.bannerUrl != undefined
          ? createBanner[0]?.bannerUrl
          : eventOrganizer.bannerUrl,
      updatedAt: DateTime.now().setZone("Asia/Jakarta").toJSDate(),
    };

    const updateEventOrganizer = await tx.eventOrganizer.update({
      data: request,
      where: {
        id,
      },
      omit: {
        deletedAt: true,
        userId: true,
      },
    });

    return updateEventOrganizer;
  });

  const formattedResponse = {
    ...result,
    createdAt: DateTime.fromJSDate(result.createdAt)
      .setZone("Asia/Jakarta")
      .toISO(),
    updatedAt: DateTime.fromJSDate(result.updatedAt)
      .setZone("Asia/Jakarta")
      .toISO(),
  };

  return snakecaseKeys(formattedResponse);
};

export const getMyEventsService = async ({
  eventOrganizerId,
  eventName,
  category,
  page,
  limit,
  userId,
}: Pick<Event, "eventOrganizerId"> &
  IGetAllEventServiceProps & { userId: string }) => {
  const eventOrganizer = await prisma.eventOrganizer.findUnique({
    where: {
      id: eventOrganizerId,
    },
  });

  if (!eventOrganizer)
    throw { message: `Event Organizer not found`, isExpose: true };

  if (eventOrganizer.userId != userId)
    throw {
      message: "Access denied. You do not have permission to view this events.",
      isExpose: true,
    };

  const where: any = {
    eventOrganizerId: eventOrganizer.id,
    deletedAt: null,
  };

  if (eventName) {
    where.eventName = {
      contains: eventName,
      mode: "insensitive",
    };
  }

  if (category && Object.values(Category).includes(category as Category)) {
    where.category = category;
  }

  const pageNumber = page != undefined && page != 0 ? page - 1 : 1;
  const limitNumber = limit != undefined ? limit : 10;
  const offset = (pageNumber - 1) * limitNumber;

  const totalData = await prisma.event.count({
    where: Object.keys(where).length > 0 ? where : undefined,
  });

  const totalPages = Math.ceil(totalData / limitNumber);

  const events = await prisma.event.findMany({
    where: Object.keys(where).length > 1 ? where : undefined,
    skip: offset,
    take: limitNumber,
    omit: {
      venueId: true,
      eventOrganizerId: true,
      description: true,
      deletedAt: true,
    },
    include: {
      eventOrganizer: {
        select: {
          companyName: true,
        },
      },
      venue: {
        select: {
          venueName: true,
          venueCapacity: true,
          address: true,
        },
      },
    },
  });

  if (!events)
    throw {
      message: "This event organizer has no events yet.",
      isExpose: true,
    };

  const eventsData = events.map((event) => {
    return {
      ...event,
      createdAt: DateTime.fromJSDate(event?.createdAt)
        .setZone("Asia/Jakarta")
        .toISO(),
      updatedAt: DateTime.fromJSDate(event?.updatedAt)
        .setZone("Asia/Jakarta")
        .toISO(),
    };
  });

  const response = {
    events: eventsData,
    pagination: {
      current_page: pageNumber,
      per_page: limitNumber,
      total_data: totalData,
      total_page: totalPages,
    },
  };

  return snakecaseKeys(response);
};
