import { Router } from "express";
import * as controller from "../controllers/inventory.controller.js";
import { body, param, query } from "express-validator";

const router = Router();

router.get("/tabs", controller.getTabs);
router.get("/materials", [query("tab").optional().isString()], controller.getInventory);
router.get("/", [query("tab").optional().isString()], controller.getInventory);
router.post(
  "/stock-in",
  [body("tabName").isString(), body("rowNumber").isInt(), body("qty").isNumeric()],
  controller.stockIn
);
router.post(
  "/stock-out",
  [
    body("tabName").isString(),
    body("rowNumber").isInt(),
    body("qty").isNumeric(),
    body("day").isInt(),
  ],
  controller.stockOut
);
router.post("/material", [body("tabName").isString(), body("values").exists()], controller.addMaterial);
router.post("/add-material", [body("tabName").isString(), body("values").exists()], controller.addMaterial);
router.post(
  "/edit-material",
  [body("tabName").isString(), body("rowNumber").isInt(), body("values").exists()],
  controller.editMaterial
);
router.post("/provision-month", controller.provisionCurrentMonth);
router.post("/provision", controller.provisionCurrentMonth);
router.put(
  "/material/:rowNumber",
  [param("rowNumber").isInt(), body("tabName").isString(), body("values").exists()],
  controller.updateMaterial
);
router.post("/", [body("tabName").isString(), body("data").exists()], controller.addInventory);
router.put("/:id", [param("id").isInt()], controller.updateInventory);
router.delete("/:id", [param("id").isInt()], controller.deleteInventory);

export default router;
