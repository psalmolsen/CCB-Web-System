import { Request, Response, NextFunction } from "express";
import * as service from "../services/pellets.service.js";
import { success, fail } from "../utils/responses.js";

export async function getPelletsTabs(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getPelletsTabs();
    res.json(success("Pellets tabs fetched", data));
  } catch (err) {
    next(err);
  }
}

export async function getPellets(req: Request, res: Response, next: NextFunction) {
  try {
    const { tab } = req.query;
    const data = await service.getPellets(String(tab || "All"));
    res.json(success("Pellets fetched", data));
  } catch (err) {
    next(err);
  }
}

export async function addPelletsReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { tabName, report } = req.body;
    await service.appendPelletsRecord(tabName, report);
    res.json(success("Pellets report appended", null));
  } catch (err) {
    next(err);
  }
}

export async function updatePellet(_req: Request, res: Response, _next: NextFunction) {
  res.status(501).json(fail("Not implemented"));
}

export async function deletePellet(_req: Request, res: Response, _next: NextFunction) {
  res.status(501).json(fail("Not implemented"));
}
