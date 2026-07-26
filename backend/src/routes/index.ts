import { Router } from "express";
import inventoryRoutes from "./inventory.routes.js";
import cnfRoutes from "./cnf.routes.js";
import oringRoutes from "./orings.routes.js";
import pelletsRoutes from "./pellets.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import stationRoutes from "./station.routes.js";

const router = Router();

router.use("/", inventoryRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/cnf", cnfRoutes);
router.use("/oring", oringRoutes);
router.use("/orings", oringRoutes);
router.use("/pellets", pelletsRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/station", stationRoutes);
router.use("/station-consumption", stationRoutes);

export default router;
