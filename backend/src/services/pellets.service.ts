import * as googleSheets from "./googleSheets.service.js";
import config from "../config/index.js";

const SPREADSHEET_ID = config.PELLETS_SPREADSHEET_ID || config.SPREADSHEET_ID || "";

export type PelletRecord = {
  rowNumber: number;
  tabName: string;
  date: string;
  dateKey: string;
  monthKey: string;
  sack: string;
  time: string;
  shift: string;
  interval: string;
  brand: string;
  good: number;
  reject: number;
  shots: number;
  kgs: string;
  remarks: string;
  status: "ok" | "warn" | "danger";
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

function computeStatus(good: number, reject: number): "ok" | "warn" | "danger" {
  const total = good + reject;
  if (total === 0) return "ok";
  const rejectRatio = reject / total;
  if (rejectRatio >= 0.2) return "danger";
  if (rejectRatio >= 0.1) return "warn";
  return "ok";
}

async function withSheetsError<T>(label: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw new Error(`${label} request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getPelletsTabs(): Promise<string[]> {
  return withSheetsError("Pellets", async () => {
    const meta = await googleSheets.getSpreadsheet(SPREADSHEET_ID);
    const sheets = meta.sheets || [];
    return sheets.map((sheet: any) => sheet.properties?.title || "");
  });
}

export async function getPellets(tabName: string): Promise<PelletRecord[]> {
  return withSheetsError("Pellets", async () => {
    const tabs = await getPelletsTabs();
    const effectiveTab = tabName && tabName.toLowerCase() !== "all" ? tabName : "";
    const sheetsToRead = effectiveTab ? [effectiveTab] : tabs;
    const items: PelletRecord[] = [];

    for (const sheet of sheetsToRead) {
      const res = await googleSheets.getValues(SPREADSHEET_ID, `${sheet}!A1:L150`);
      const rows: any[][] = res.values || [];

      for (let i = 1; i < rows.length; i += 1) {
        const row = rows[i];
        const date = getCellString(row, 0);
        if (!date) continue;
        const good = getCellNumber(row, 6);
        const reject = getCellNumber(row, 7);
        const shots = Math.max(getCellNumber(row, 8), good + reject);
        const record: PelletRecord = {
          rowNumber: i + 1,
          tabName: sheet,
          date,
          dateKey: parseDateKey(date),
          monthKey: getMonthKey(date),
          sack: getCellString(row, 1),
          time: getCellString(row, 2),
          shift: getCellString(row, 3),
          interval: getCellString(row, 4),
          brand: getCellString(row, 5),
          good,
          reject,
          shots,
          kgs: getCellString(row, 9),
          remarks: getCellString(row, 10),
          status: computeStatus(good, reject),
        };
        items.push(record);
      }
    }

    return items;
  });
}

export async function appendPelletsRecord(tabName: string, report: any): Promise<void> {
  return withSheetsError("Pellets", async () => {
    const groups = report?.dateGroups || [];
    const rows: any[][] = [];
    for (const group of groups) {
      const date = group?.date || "";
      for (const shift of group.shifts || []) {
        const good = Number(shift.good) || 0;
        const reject = Number(shift.reject) || 0;
        const row = [
          date,
          shift.sack || "",
          shift.time || "",
          shift.time || "",
          "",
          tabName || "",
          good,
          reject,
          good + reject,
          shift.kgs || "",
          shift.remarks || "",
          computeStatus(good, reject),
        ];
        rows.push(row);
      }
    }
    if (rows.length === 0) return;
    await googleSheets.appendValues(SPREADSHEET_ID, `${tabName}!A:L`, rows);
  });
}
