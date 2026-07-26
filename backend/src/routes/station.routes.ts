import { Router } from "express";
import * as controller from "../controllers/station.controller.js";
import { body } from "express-validator";

const router = Router();

router.get("/records", controller.getStationRecords);
router.post("/add-record", controller.addStationRecord);
router.post("/records", controller.addStationRecord);
router.get("/materials/tabs", controller.getMaterialTabs);
router.get("/materials/current", controller.getMaterialsCurrentMonth);
router.get("/materials", controller.getMaterialsCurrentMonth);
router.post(
  "/materials/deduct",
  [body("materialCode").isString(), body("quantity").isNumeric(), body("date").isString()],
  controller.deductMaterial
);

export default router;
