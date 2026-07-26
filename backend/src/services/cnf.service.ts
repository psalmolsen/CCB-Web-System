import * as googleSheets from "./googleSheets.service.js";
import config from "../config/index.js";

const SPREADSHEET_ID = config.CNF_SPREADSHEET_ID || config.SPREADSHEET_ID || "";

export type CnfItem = {
  rowNumber: number;
  tabName: string;
  brand: string;
  category: string;
  variant: string;
  uom: string;
  price: number;
  initialStock: number;
  inQuantity: number;
  date: string;
  currentBalance: number;
  outQuantity: number;
  dateColumns: number[];
  totalIssued: number;
};

function getCellString(row: any[], index: number): string {
  if (!row || index >= row.length) return "";
  const value = row[index];
  return value !== undefined && value !== null ? String(value).trim() : "";
}

function getCellNumber(row: any[], index: number): number {
  const value = getCellString(row, index);
  if (!value) return 0;
  const parsed = parseFloat(String(value).replace(/,/g, ""));
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getColumnLetter(colNum: number): string {
  let temp;
  let letter = "";
  while (colNum > 0) {
    temp = (colNum - 1) % 26;
    letter = String.fromCharCode(65 + temp) + letter;
    colNum = Math.floor((colNum - temp - 1) / 26);
  }
  return letter;
}

async function withSheetsError<T>(label: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw new Error(`${label} request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getCnfTabs(): Promise<string[]> {
  return withSheetsError("CNF", async () => {
    const meta = await googleSheets.getSpreadsheet(SPREADSHEET_ID);
    const sheets = meta.sheets || [];
    return sheets.map((sheet: any) => sheet.properties?.title || "");
  });
}

export async function getCnfItems(tabName: string): Promise<CnfItem[]> {
  return withSheetsError("CNF", async () => {
    const tabs = await getCnfTabs();
    const effectiveTab = tabName || tabs[0] || "Sheet1";
    const range = `${effectiveTab}!A1:AN150`;
    const res = await googleSheets.getValues(SPREADSHEET_ID, range);
    const rows: any[][] = res.values || [];
    const items: CnfItem[] = [];

    for (let i = 1; i < rows.length; i += 1) {
      const row = rows[i];
      const brand = getCellString(row, 0);
      const category = getCellString(row, 1);
      const variant = getCellString(row, 2);
      const uom = getCellString(row, 3);
      if (!brand && !category && !variant) continue;

      const dateColumns: number[] = [];
      for (let day = 0; day < 31; day += 1) {
        dateColumns.push(getCellNumber(row, 10 + day));
      }

      items.push({
        rowNumber: i + 1,
        tabName: effectiveTab,
        brand,
        category: category.toUpperCase() as CnfItem["category"],
        variant,
        uom,
        price: getCellNumber(row, 4),
        initialStock: getCellNumber(row, 5),
        inQuantity: getCellNumber(row, 6),
        date: getCellString(row, 7),
        currentBalance: getCellNumber(row, 8),
        outQuantity: getCellNumber(row, 9),
        dateColumns,
        totalIssued: getCellNumber(row, 41),
      });
    }

    return items;
  });
}

export async function updateCnfStockIn(tabName: string, rowNumber: number, qty: number): Promise<void> {
  return withSheetsError("CNF", async () => {
    const balanceCell = `I${rowNumber}`;
    const inQuantityCell = `G${rowNumber}`;
    const currentValues = await googleSheets.getValues(SPREADSHEET_ID, `${tabName}!${inQuantityCell}:${balanceCell}`);
    const row = currentValues.values?.[0] || [];
    const currentIn = getCellNumber(row, 0);
    const currentBalance = getCellNumber(row, 2);
    const updatedIn = currentIn + qty;
    const updatedBalance = currentBalance + qty;
    await googleSheets.updateValues(SPREADSHEET_ID, `${tabName}!${inQuantityCell}`, [[updatedIn]]);
    await googleSheets.updateValues(SPREADSHEET_ID, `${tabName}!${balanceCell}`, [[updatedBalance]]);
  });
}

export async function updateCnfStockOut(tabName: string, rowNumber: number, qty: number, day: number): Promise<void> {
  return withSheetsError("CNF", async () => {
    const balanceCell = `I${rowNumber}`;
    const outQuantityCell = `J${rowNumber}`;
    const dayColumn = getColumnLetter(11 + (day - 1));
    const dayCell = `${dayColumn}${rowNumber}`;

    const currentValues = await googleSheets.getValues(SPREADSHEET_ID, `${tabName}!${outQuantityCell}:${dayCell}`);
    const row = currentValues.values?.[0] || [];
    const currentOut = getCellNumber(row, 0);
    const currentDayQty = getCellNumber(row, 1);
    const currentBalance = getCellNumber(row, 2);
    const updatedOut = currentOut + qty;
    const updatedDayQty = currentDayQty + qty;
    const updatedBalance = currentBalance - qty;

    await googleSheets.updateValues(SPREADSHEET_ID, `${tabName}!${outQuantityCell}`, [[updatedOut]]);
    await googleSheets.updateValues(SPREADSHEET_ID, `${tabName}!${dayCell}`, [[updatedDayQty]]);
    await googleSheets.updateValues(SPREADSHEET_ID, `${tabName}!${balanceCell}`, [[updatedBalance]]);
  });
}

export async function updateCnfItem(tabName: string, rowNumber: number, data: Partial<CnfItem>): Promise<void> {
  return withSheetsError("CNF", async () => {
    const values = [
      data.brand ?? "",
      data.category ?? "",
      data.variant ?? "",
      data.uom ?? "",
      data.price ?? 0,
      data.initialStock ?? 0,
      data.inQuantity ?? 0,
      data.date ?? "",
      data.currentBalance ?? 0,
      data.outQuantity ?? 0,
    ];
    await googleSheets.updateValues(SPREADSHEET_ID, `${tabName}!A${rowNumber}:J${rowNumber}`, [values]);
  });
}

export async function addCnfItem(tabName: string, data: Partial<CnfItem>): Promise<void> {
  return withSheetsError("CNF", async () => {
    const values = [
      data.brand ?? "",
      data.category ?? "",
      data.variant ?? "",
      data.uom ?? "",
      data.price ?? 0,
      data.initialStock ?? 0,
      data.inQuantity ?? 0,
      data.date ?? new Date().toISOString().slice(0, 10),
      data.currentBalance ?? 0,
      data.outQuantity ?? 0,
    ];
    const blanks = Array(31).fill("");
    await googleSheets.appendValues(SPREADSHEET_ID, `${tabName}!A:J`, [[...values, ...blanks]]);
  });
}
