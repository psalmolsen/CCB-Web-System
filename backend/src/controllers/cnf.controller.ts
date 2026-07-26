import { Request, Response, NextFunction } from "express";
import * as service from "../services/cnf.service.js";
import { success, fail } from "../utils/responses.js";
import { validationResult } from "express-validator";

export async function getCnfTabs(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getCnfTabs();
    res.json(success("CNF tabs fetched", data));
  } catch (err) {
    next(err);
  }
}

export async function getCnf(req: Request, res: Response, next: NextFunction) {
  try {
    const { tab } = req.query;
    const data = await service.getCnfItems(String(tab || ""));
    res.json(success("CNF fetched", data));
  } catch (err) {
    next(err);
  }
}

export async function cnfStockIn(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(fail("Validation error"));
    const { tabName, rowNumber, qty } = req.body;
    await service.updateCnfStockIn(tabName, Number(rowNumber), Number(qty));
    res.json(success("CNF stock-in updated", null));
  } catch (err) {
    next(err);
  }
}

export async function cnfStockOut(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(fail("Validation error"));
    const { tabName, rowNumber, qty, day } = req.body;
    await service.updateCnfStockOut(tabName, Number(rowNumber), Number(qty), Number(day));
    res.json(success("CNF stock-out updated", null));
  } catch (err) {
    next(err);
  }
}

export async function cnfEditItem(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(fail("Validation error"));
    const { tabName, rowNumber, values } = req.body;
    await service.updateCnfItem(tabName, Number(rowNumber), values);
    res.json(success("CNF item updated", null));
  } catch (err) {
    next(err);
  }
}

export async function addNewCnf(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(fail("Validation error"));
    const { tabName, brand, parts } = req.body;

    if (!tabName || !brand || !Array.isArray(parts) || parts.length === 0) {
      return res.status(400).json(fail("Invalid payload"));
    }

    for (const part of parts) {
      if (!part.name || !Array.isArray(part.variants)) continue;
      for (const variant of part.variants) {
        await service.addCnfItem(tabName, {
          brand: brand.trim(),
          category: part.name.trim().toUpperCase(),
          variant: String(variant).trim(),
          uom: "Pcs",
          price: 0,
          initialStock: 0,
          inQuantity: 0,
          date: "",
          currentBalance: 0,
          outQuantity: 0,
        });
      }
    }

    res.json(success("CNF brand added", null));
  } catch (err) {
    next(err);
  }
}

export async function addCnf(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(fail("Validation error"));
    const { tabName, data } = req.body;
    await service.addCnfItem(tabName, data);
    res.json(success("CNF added", null));
  } catch (err) {
    next(err);
  }
}

export async function updateCnf(req: Request, res: Response, next: NextFunction) {
  try {
    const rowNumber = Number(req.params.id);
    const { tabName, data } = req.body;
    await service.updateCnfItem(tabName, rowNumber, data);
    res.json(success("CNF updated", null));
  } catch (err) {
    next(err);
  }
}

export async function deleteCnf(_req: Request, res: Response, _next: NextFunction) {
  res.status(501).json(fail("Delete operation is not supported for CNF items"));
}
