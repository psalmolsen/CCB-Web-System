import { Request, Response, NextFunction } from "express";
import * as service from "../services/oring.service.js";
import { success, fail } from "../utils/responses.js";

export async function getOringTabs(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getOringTabs();
    res.json(success("O-Ring tabs fetched", data));
  } catch (err) {
    next(err);
  }
}

export async function getOrings(req: Request, res: Response, next: NextFunction) {
  try {
    const { tab } = req.query;
    const data = await service.getOringData(String(tab || "All"));
    res.json(success("O-Rings fetched", data));
  } catch (err) {
    next(err);
  }
}

export async function addOringReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { tabName, report } = req.body;
    await service.appendOringReport(tabName, report);
    res.json(success("O-Ring report appended", null));
  } catch (err) {
    next(err);
  }
}

export async function updateOring(_req: Request, res: Response, _next: NextFunction) {
  res.status(501).json(fail("Not implemented"));
}

export async function deleteOring(_req: Request, res: Response, _next: NextFunction) {
  res.status(501).json(fail("Not implemented"));
}
