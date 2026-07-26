import { Router } from "express";
import * as controller from "../controllers/orings.controller.js";
import { body, query, param } from "express-validator";

const router = Router();

router.get("/tabs", controller.getOringTabs);
router.get("/data", [query("tab").optional().isString()], controller.getOrings);
router.post("/add-record", [body("tabName").isString(), body("report").exists()], controller.addOringReport);
router.put("/:id", [param("id").isInt()], controller.updateOring);
router.delete("/:id", [param("id").isInt()], controller.deleteOring);

export default router;
