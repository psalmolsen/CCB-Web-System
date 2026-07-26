import { Router } from "express";
import { listOrings } from "../controllers/oring.controller.js";

const router = Router();

router.get("/", listOrings);

export default router;
