import { Request, Response, NextFunction } from "express";
import { fail } from "../utils/responses.js";

export default function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json(fail(message, status));
}
