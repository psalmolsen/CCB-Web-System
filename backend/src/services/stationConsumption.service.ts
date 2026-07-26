import * as googleSheets from "./googleSheets.service.js";
import * as inventoryService from "./inventory.service.js";
import config from "../config/index.js";

const SPREADSHEET_ID = config.STATION_SPREADSHEET_ID || config.SPREADSHEET_ID || "";
const MATERIAL_SPREADSHEET_ID = config.MATERIAL_SPREADSHEET_ID || config.SPREADSHEET_ID || "";

export type StationConsumptionRecord = {
  date: string;
  station: string;
  materialCode: string;
  description: string;
  quantity: number;
  uom: string;
  unitCost: number;
  totalCost: number;
  signature: string;
};

export type MaterialItem = {
  code: string;
  description: string;
  uom: string;
  price: number;
  balance: number;
};

function parseDateKey(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getCellString(row: any[], index: number): string {
  if (!row || index >= row.length) return "";
  const value = row[index];
  return value !== undefined && value !== null ? String(value).trim() : "";
}

function getCellNumber(row: any[], index: number): number {
  const value = getCellString(row, index);
  if (!value) return 0;
  const parsed = parseFloat(value.replace(/,/g, ""));
  return Number.isNaN(parsed) ? 0 : parsed;
}

async function withSheetsError<T>(label: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw new Error(`${label} request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getStationConsumptionRecords(): Promise<StationConsumptionRecord[]> {
  return withSheetsError("Station Consumption", async () => {
    const meta = await googleSheets.getSpreadsheet(SPREADSHEET_ID);
    const sheetName = meta.sheets?.[0]?.properties?.title || "Sheet1";
    const res = await googleSheets.getValues(SPREADSHEET_ID, `${sheetName}!A1:I150`);
    const rows: any[][] = res.values || [];
    const records: StationConsumptionRecord[] = [];

    for (let i = 1; i < rows.length; i += 1) {
      const row = rows[i];
      const date = getCellString(row, 0);
      if (!date) continue;
      records.push({
        date,
        station: getCellString(row, 1),
        materialCode: getCellString(row, 2),
        description: getCellString(row, 3),
        quantity: getCellNumber(row, 4),
        uom: getCellString(row, 5),
        unitCost: getCellNumber(row, 6),
        totalCost: getCellNumber(row, 7),
        signature: getCellString(row, 8),
      });
    }
    return records;
  });
}

export async function addStationConsumptionRecord(record: StationConsumptionRecord): Promise<void> {
  return withSheetsError("Station Consumption", async () => {
    const meta = await googleSheets.getSpreadsheet(SPREADSHEET_ID);
    const sheetName = meta.sheets?.[0]?.properties?.title || "Sheet1";
    await googleSheets.appendValues(SPREADSHEET_ID, `${sheetName}!A:I`, [[
      record.date,
      record.station,
      record.materialCode,
      record.description,
      record.quantity,
      record.uom,
      record.unitCost,
      record.totalCost,
      record.signature,
    ]]);
  });
}

export async function getMaterialMonitoringTabs(): Promise<string[]> {
  return inventoryService.getTabs();
}

export async function getMaterialsFromCurrentMonth(): Promise<MaterialItem[]> {
  return withSheetsError("Material Monitoring", async () => {
    const tabs = await inventoryService.getTabs();
    const currentTab = tabs.length > 0 ? tabs[tabs.length - 1] : "";
    const materials = currentTab ? await inventoryService.getMaterials(currentTab) : [];
    return materials.map((item) => ({
      code: item.code,
      description: item.desc,
      uom: item.uom,
      price: item.price ?? 0,
      balance: item.balance,
    }));
  });
}

export async function deductMaterialBalance(materialCode: string, quantity: number, date: string): Promise<void> {
  return withSheetsError("Station Consumption", async () => {
    const tabs = await inventoryService.getTabs();
    for (const tab of tabs) {
      const materials = await inventoryService.getMaterials(tab);
      const material = materials.find((item) => item.code.toLowerCase() === materialCode.toLowerCase());
      if (!material) continue;

      const parsedDate = new Date(date);
      if (Number.isNaN(parsedDate.getTime())) {
        throw new Error("Invalid date format");
      }

      const day = parsedDate.getDate();
      await inventoryService.updateStockOut(tab, material.rowNumber, quantity, day);
      return;
    }

    throw new Error(`Material with code "${materialCode}" not found`);
  });
}
