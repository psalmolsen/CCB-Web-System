import { Request, Response, NextFunction } from "express";
import { fail } from "../utils/responses.js";

export default function notFound(_req: Request, res: Response, _next: NextFunction) {
  res.status(404).json(fail("Route not found"));
}
