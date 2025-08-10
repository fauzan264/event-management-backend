import { Request, Response } from "express";
import { getDashboardService } from "../services/dashboard.service";

export const getDashboardController = async (req: Request, res: Response) => {
  const { organizerId } = req.params;
  const { userId } = res.locals.payload;

  const dashboard = await getDashboardService({ id: organizerId, userId });

  return res.status(200).json({
    status: true,
    message: "Successfully fetched dashboard data.",
    data: dashboard,
  });
};
