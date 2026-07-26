import { Request, Response, NextFunction } from "express";
import * as service from "../services/dashboard.service.js";
import { success } from "../utils/responses.js";

export async function getDashboard(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getDashboard();
    res.json(success("Dashboard data", data));
  } catch (err) {
    next(err);
  }
}
