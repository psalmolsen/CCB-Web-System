import { Router } from "express";
import * as controller from "../controllers/cnf.controller.js";
import { body, query } from "express-validator";

const router = Router();

router.get("/tabs", controller.getCnfTabs);
router.get("/items", [query("tab").optional().isString()], controller.getCnf);
router.post(
  "/stock-in",
  [body("tabName").isString(), body("rowNumber").isInt(), body("qty").isNumeric()],
  controller.cnfStockIn
);
router.post(
  "/stock-out",
  [
    body("tabName").isString(),
    body("rowNumber").isInt(),
    body("qty").isNumeric(),
    body("day").isInt(),
  ],
  controller.cnfStockOut
);
router.post(
  "/edit-item",
  [body("tabName").isString(), body("rowNumber").isInt(), body("values").exists()],
  controller.cnfEditItem
);
router.post(
  "/add-new",
  [body("tabName").isString(), body("brand").isString(), body("parts").isArray()],
  controller.addNewCnf
);
router.get("/", controller.getCnf);
router.post("/", [body("tabName").isString(), body("data").exists()], controller.addCnf);
router.put("/:id", controller.updateCnf);
router.delete("/:id", controller.deleteCnf);

export default router;
