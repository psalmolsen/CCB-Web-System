import { Request, Response, NextFunction } from "express";
import * as service from "../services/stationConsumption.service.js";
import { success, fail } from "../utils/responses.js";
import { validationResult } from "express-validator";

export async function getStationRecords(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getStationConsumptionRecords();
    res.json(success("Station records", data));
  } catch (err) {
    next(err);
  }
}

export async function addStationRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const record = req.body;
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      return res.status(400).json(fail("Invalid record payload"));
    }
    await service.addStationConsumptionRecord(record);
    res.json(success("Record added", null));
  } catch (err) {
    next(err);
  }
}

export async function getMaterialTabs(_req: Request, res: Response, next: NextFunction) {
  try {
    const tabs = await service.getMaterialMonitoringTabs();
    res.json(success("Material tabs", tabs));
  } catch (err) {
    next(err);
  }
}

export async function getMaterialsCurrentMonth(_req: Request, res: Response, next: NextFunction) {
  try {
    const mats = await service.getMaterialsFromCurrentMonth();
    res.json(success("Materials", mats));
  } catch (err) {
    next(err);
  }
}

export async function deductMaterial(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(fail("Validation error"));
    const { materialCode, quantity, date } = req.body;
    await service.deductMaterialBalance(materialCode, Number(quantity), date);
    res.json(success("Material deducted", null));
  } catch (err) {
    next(err);
  }
}
