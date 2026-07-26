import * as googleSheets from "./googleSheets.service.js";
import config from "../config/index.js";

const SPREADSHEET_ID = config.ORING_SPREADSHEET_ID || config.SPREADSHEET_ID || "";

export type OringRecord = {
  rowNumber: number;
  tabName: string;
  date: string;
  time: string;
  valveCameFrom: string;
  valvesRepaired: number;
  installedTo: string;
  good: number;
  reject: number;
  remarks: string;
  dateKey: string;
  monthKey: string;
  timeSort: number;
  sourceKey: string;
  installedKey: string;
};

function parseDateKey(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getMonthKey(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
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

export async function getOringTabs(): Promise<string[]> {
  return withSheetsError("O-Ring", async () => {
    const meta = await googleSheets.getSpreadsheet(SPREADSHEET_ID);
    const sheets = meta.sheets || [];
    return sheets.map((sheet: any) => sheet.properties?.title || "");
  });
}

function normalizeTabName(tabName: string, tabs: string[]) {
  if (!tabName || tabName.toLowerCase() === "all") return "";
  const match = tabs.find((t) => t.toLowerCase() === tabName.toLowerCase());
  return match || tabName;
}

export async function getOringData(tabName: string): Promise<OringRecord[]> {
  return withSheetsError("O-Ring", async () => {
    const tabs = await getOringTabs();
    const effectiveTab = normalizeTabName(tabName, tabs);
    const sheetsToRead = effectiveTab ? [effectiveTab] : tabs;
    const records: OringRecord[] = [];

    for (const sheet of sheetsToRead) {
      const res = await googleSheets.getValues(SPREADSHEET_ID, `${sheet}!A1:H150`);
      const rows: any[][] = res.values || [];
      for (let i = 1; i < rows.length; i += 1) {
        const row = rows[i];
        const date = getCellString(row, 0);
        if (!date) continue;
        const record: OringRecord = {
          rowNumber: i + 1,
          tabName: sheet,
          date,
          time: getCellString(row, 1),
          valveCameFrom: getCellString(row, 2),
          valvesRepaired: getCellNumber(row, 4),
          installedTo: getCellString(row, 3),
          good: getCellNumber(row, 5),
          reject: getCellNumber(row, 6),
          remarks: getCellString(row, 7),
          dateKey: parseDateKey(date),
          monthKey: getMonthKey(date),
          timeSort: getCellNumber(row, 1) || 0,
          sourceKey: getCellString(row, 2).toLowerCase(),
          installedKey: getCellString(row, 3).toLowerCase(),
        };
        records.push(record);
      }
    }

    return records;
  });
}

export async function appendOringReport(tabName: string, report: any): Promise<void> {
  return withSheetsError("O-Ring", async () => {
    const payload = report || {};
    const row = [
      payload.date || "",
      payload.time || "",
      payload.source || payload.valveCameFrom || "",
      payload.installedTo || "",
      payload.repaired ?? payload.valvesRepaired ?? 0,
      payload.good ?? 0,
      payload.reject ?? payload.rejected ?? 0,
      payload.remarks || "",
    ];
    await googleSheets.appendValues(SPREADSHEET_ID, `${tabName}!A:H`, [row]);
  });
}
