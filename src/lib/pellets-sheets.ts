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
