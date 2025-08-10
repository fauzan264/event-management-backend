import snakecaseKeys from "snakecase-keys";
import { prisma } from "../db/connection";
import { Category, Event, Venue } from "../generated/prisma";
import { cloudinaryUpload } from "../lib/cloudinary.upload";
import { DateTime } from "luxon";
import { IGetAllEventServiceProps } from "../types/event";

interface ICreateEventServiceProps
  extends Pick<
    Event,
    | "eventName"
    | "category"
    | "startDate"
    | "endDate"
    | "description"
    | "price"
    | "availableTicket"
  > {
  imageUrl: Express.Multer.File[];
}

interface IUpdateEventServiceProps
  extends Pick<
    Event,
    | "id"
    | "eventName"
    | "category"
    | "startDate"
    | "endDate"
    | "description"
    | "price"
    | "availableTicket"
  > {
  imageUrl: Express.Multer.File[];
}

type ImageEvent = { imageUrl: string | undefined | null };

export const createEventService = async ({
  eventName,
  category,
  startDate,
  endDate,
  description,
  price,
  availableTicket,
  imageUrl,
  venueName,
  venueCapacity,
  address,
  userId,
}: ICreateEventServiceProps &
  Pick<Venue, "venueName" | "venueCapacity" | "address"> & {
    userId: string;
  }) => {
  const eventOrganizer = await prisma.eventOrganizer.findUnique({
    where: {
      userId: userId,
    },
  });

  if (!eventOrganizer)
    throw {
      message: "User does not have event organizer access",
      isExpose: true,
    };

  if (!Object.values(Category).includes(category)) {
    throw { message: `Category not found`, isExpose: true };
  }

  if (startDate > endDate)
    throw {
      message: "Start date must be earlier than or equal to end date.",
      isExpose: true,
    };

  const uploadImage = imageUrl.map(async (image) => {
    const res: any = await cloudinaryUpload(image?.buffer, "event");

    return { imageUrl: res.secureUrl };
  });

  const imageCreate = await Promise.all(uploadImage);

  const result = await prisma.$transaction(async (tx) => {
    // create venue
    const venue = await tx.venue.create({
      data: {
        venueName,
        venueCapacity,
        address,
      },
    });

    // create event
    const event = await tx.event.create({
      data: {
        eventName,
        category,
        startDate,
        endDate,
        imageUrl: imageCreate[0].imageUrl,
        description,
        price,
        availableTicket,
        venueId: venue?.id,
        eventOrganizerId: eventOrganizer?.id,
        createdAt: DateTime.now().setZone("Asia/Jakarta").toJSDate(),
      },
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

    return event;
  });

  const formattedResponse = {
    ...result,
    startDate: DateTime.fromJSDate(result.startDate)
      .setZone("Asia/Jakarta")
      .toISO(),
    endDate: DateTime.fromJSDate(result.endDate)
      .setZone("Asia/Jakarta")
      .toISO(),
    createdAt: DateTime.fromJSDate(result.createdAt)
      .setZone("Asia/Jakarta")
      .toISO(),
    updatedAt: DateTime.fromJSDate(result.updatedAt)
      .setZone("Asia/Jakarta")
      .toISO(),
  };

  return snakecaseKeys(formattedResponse, { deep: true });
};

export const getAllEventService = async ({
  eventName,
  category,
  page,
  limit,
}: IGetAllEventServiceProps) => {
  const where: any = {
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
    orderBy: {
      createdAt: "desc",
    },
    omit: {
      venueId: true,
      eventOrganizerId: true,
      deletedAt: true,
    },
    include: {
      venue: true,
    },
  });

  const response = {
    events: events,
    pagination: {
      current_page: pageNumber,
      per_page: limitNumber,
      total_data: totalData,
      total_page: totalPages,
    },
  };

  return snakecaseKeys(response);
};

export const getEventByIdService = async ({ id }: Pick<Event, "id">) => {
  const event = await prisma.event.findUnique({
    where: {
      id,
    },
    omit: {
      venueId: true,
      eventOrganizerId: true,
      deletedAt: true,
    },
    include: {
      eventOrganizer: {
        select: {
          id: true,
          companyName: true,
          bankAccount:true
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

  if (!event) throw { message: `Event not found.`, isExpose: true };

  const formattedResponse = {
    ...event,
    startDate: DateTime.fromJSDate(event.startDate)
      .setZone("Asia/Jakarta")
      .toISO(),
    endDate: DateTime.fromJSDate(event.endDate).setZone("Asia/Jakarta").toISO(),
    createdAt: DateTime.fromJSDate(event.createdAt)
      .setZone("Asia/Jakarta")
      .toISO(),
    updatedAt: DateTime.fromJSDate(event.updatedAt)
      .setZone("Asia/Jakarta")
      .toISO(),
  };

  return snakecaseKeys(formattedResponse, { deep: true });
};

export const updateEventService = async ({
  id,
  eventName,
  category,
  startDate,
  endDate,
  description,
  price,
  availableTicket,
  imageUrl,
  venueName,
  venueCapacity,
  address,
  userId,
}: IUpdateEventServiceProps &
  Pick<Venue, "venueName" | "venueCapacity" | "address"> & {
    userId: string;
  }) => {
  const eventOrganizer = await prisma.eventOrganizer.findUnique({
    where: {
      userId: userId,
    },
  });

  if (!eventOrganizer)
    throw {
      message: "User does not have event organizer access",
      isExpose: true,
    };

  if (!Object.values(Category).includes(category)) {
    throw { message: `Category not found`, isExpose: true };
  }

  if (startDate > endDate)
    throw {
      message: "Start date must be earlier than or equal to end date.",
      isExpose: true,
    };

  const event = await prisma.event.findUnique({
    where: {
      id,
    },
    include: {
      venue: true,
      eventOrganizer: true,
    },
  });

  let updateImage: ImageEvent[] = [];
  if (imageUrl?.length) {
    const uploadImage = imageUrl.map(async (image) => {
      const res: any = await cloudinaryUpload(image?.buffer, "event");

      return { imageUrl: res.secureUrl };
    });

    updateImage = await Promise.all(uploadImage);
  } else {
    updateImage.push({ imageUrl: event?.imageUrl });
  }

  const result = await prisma.$transaction(async (tx) => {
    const requestUpdateVenue = {
      venueName: venueName ? venueName : event?.venue.venueName,
      venueCapacity: venueCapacity ? venueCapacity : event?.venue.venueCapacity,
      address: address ? address : event?.venue.address,
    };

    // update venue
    await tx.venue.update({
      data: requestUpdateVenue,
      where: {
        id: event?.venueId,
      },
    });

    const requestEvent = {
      eventName: eventName ? eventName : event?.eventName,
      category: category ? category : event?.category,
      startDate: startDate ? startDate : event?.startDate,
      endDate: endDate ? endDate : event?.endDate,
      imageUrl: updateImage[0]?.imageUrl
        ? updateImage[0].imageUrl
        : event?.imageUrl,
      description: description ? description : event?.description,
      price: price ? price : event?.price,
      availableTicket: availableTicket
        ? availableTicket
        : event?.availableTicket,
      updatedAt: DateTime.now().setZone("Asia/Jakarta").toJSDate(),
    };

    const updateEvent = await tx.event.update({
      data: requestEvent,
      where: {
        id,
      },
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

    return updateEvent;
  });

  const formattedResponse = {
    ...result,
    startDate: DateTime.fromJSDate(result.startDate)
      .setZone("Asia/Jakarta")
      .toISO(),
    endDate: DateTime.fromJSDate(result.endDate)
      .setZone("Asia/Jakarta")
      .toISO(),
    createdAt: DateTime.fromJSDate(result.createdAt)
      .setZone("Asia/Jakarta")
      .toISO(),
    updatedAt: DateTime.fromJSDate(result.updatedAt)
      .setZone("Asia/Jakarta")
      .toISO(),
  };

  return snakecaseKeys(formattedResponse, { deep: true });
};

export const deleteEventService = async ({
  id,
  userId,
}: Pick<Event, "id"> & { userId: string }) => {
  const event = await prisma.event.findUnique({
    where: {
      id,
    },
  });

  if (!event) throw { message: `Event not found.`, isExpose: true };

  const eventOrganizer = await prisma.eventOrganizer.findUnique({
    where: {
      userId,
    },
  });

  if (event.eventOrganizerId != eventOrganizer?.id)
    throw {
      message: `Access denied. You do not have permission to modify this event`,
      isExpose: true,
    };

  await prisma.event.update({
    data: {
      updatedAt: DateTime.now().setZone("Asia/Jakarta").toJSDate(),
      deletedAt: DateTime.now().setZone("Asia/Jakarta").toJSDate(),
    },
    where: {
      id,
    },
  });
};
