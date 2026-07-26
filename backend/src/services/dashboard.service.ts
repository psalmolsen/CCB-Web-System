import * as inventory from "./inventory.service.js";
import * as cnf from "./cnf.service.js";
import * as oring from "./oring.service.js";
import * as pellets from "./pellets.service.js";

export async function getDashboard() {
  const [inventoryMaterials, cnfItems, oringRecords, pelletsRecords] = await Promise.all([
    inventory.getMaterials(""),
    cnf.getCnfItems(""),
    oring.getOringData("All"),
    pellets.getPellets("All"),
  ]);

  return {
    inventoryCount: inventoryMaterials.length,
    cnfCount: cnfItems.length,
    oringCount: oringRecords.length,
    pelletsCount: pelletsRecords.length,
  };
}
