import { Request, Response, NextFunction } from "express";
import * as service from "../services/inventory.service.js";
import { success, fail } from "../utils/responses.js";
import { validationResult } from "express-validator";

export async function getTabs(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getTabs();
    res.json(success("Inventory tabs fetched", data));
  } catch (err) {
    next(err);
  }
}

export async function getInventory(req: Request, res: Response, next: NextFunction) {
  try {
    const { tab } = req.query;
    const data = await service.getMaterials(String(tab || ""));
    res.json(success("Inventory fetched", data));
  } catch (err) {
    next(err);
  }
}

export async function stockIn(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(fail("Validation error"));
    const { tabName, rowNumber, qty } = req.body;
    await service.updateStockIn(tabName, Number(rowNumber), Number(qty));
    res.json(success("Stock updated", null));
  } catch (err) {
    next(err);
  }
}

export async function stockOut(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(fail("Validation error"));
    const { tabName, rowNumber, qty, day } = req.body;
    await service.updateStockOut(tabName, Number(rowNumber), Number(qty), Number(day));
    res.json(success("Daily stock updated", null));
  } catch (err) {
    next(err);
  }
}

export async function addMaterial(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(fail("Validation error"));
    const { tabName, values } = req.body;
    await service.addMaterial(tabName, values);
    res.json(success("Material added", null));
  } catch (err) {
    next(err);
  }
}

export async function updateMaterial(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(fail("Validation error"));
    const { rowNumber } = req.params;
    const { tabName, values } = req.body;
    await service.updateMaterial(tabName, Number(rowNumber), values);
    res.json(success("Material updated", null));
  } catch (err) {
    next(err);
  }
}

export async function editMaterial(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(fail("Validation error"));
    const { tabName, rowNumber, values } = req.body;
    await service.updateMaterial(tabName, Number(rowNumber), values);
    res.json(success("Material updated", null));
  } catch (err) {
    next(err);
  }
}

export async function provisionCurrentMonth(_req: Request, res: Response, next: NextFunction) {
  try {
    const created = await service.provisionCurrentMonth();
    res.json(success("Provision complete", { created }));
  } catch (err) {
    next(err);
  }
}

export async function addInventory(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(fail("Validation error"));
    const { tabName, data } = req.body;
    await service.addInventory(tabName, data);
    res.json(success("Inventory added", null));
  } catch (err) {
    next(err);
  }
}

export async function updateInventory(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(fail("Validation error"));
    const id = Number(req.params.id);
    const { tabName, data } = req.body;
    await service.updateInventory(tabName, id, data);
    res.json(success("Inventory updated", null));
  } catch (err) {
    next(err);
  }
}

export async function deleteInventory(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await service.deleteInventory(id);
    res.json(success("Inventory deleted", null));
  } catch (err) {
    next(err);
  }
}
