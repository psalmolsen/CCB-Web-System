import { Router } from "express";
import * as controller from "../controllers/pellets.controller.js";
import { body, query, param } from "express-validator";

const router = Router();

router.get("/tabs", controller.getPelletsTabs);
router.get("/data", [query("tab").optional().isString()], controller.getPellets);
router.post("/add-record", [body("tabName").isString(), body("report").exists()], controller.addPelletsReport);
router.put("/:id", [param("id").isInt()], controller.updatePellet);
router.delete("/:id", [param("id").isInt()], controller.deletePellet);

export default router;
