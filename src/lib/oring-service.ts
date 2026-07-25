export interface OringRecord {
  id: string;
  date: string;
  timeSlot: TimeSlot;
  source: string;
  repaired: number;
  installedTo: string;
  good: number;
  rejected: number;
  remarks?: string;
  parsedDate: Date | null;
}

export type TimeSlot = "Morning" | "Midday" | "Afternoon" | "Evening";
