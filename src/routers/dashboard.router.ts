import { Router } from "express";
import { jwtVerify } from "../middleware/jwt.verify";
import { getDashboardController } from "../controllers/dashboard.controller";

const dashboardRouter = Router();

dashboardRouter.get("/:organizerId", jwtVerify, getDashboardController);

export default dashboardRouter;
