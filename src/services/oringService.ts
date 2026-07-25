// Replaces src/lib/oring-server-functions.ts (createServerFn calls)

const BASE = "/api/oring";

export async function getOringTabsFn(): Promise<string[]> {
  const res = await fetch(`${BASE}/tabs`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getOringDataFn({ data: tabName }: { data: string }): Promise<any[]> {
  const res = await fetch(`${BASE}/data?tab=${encodeURIComponent(tabName)}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function addOringRecordFn({ data }: {
  data: {
    tabName: string;
    valveCameFrom: string;
    dateGroups: {
      date: string;
      shifts: {
        time: string;
        valveCameFrom: string;
        installedTo: string;
        valvesRepaired: number;
        good: number;
        reject: number;
        remarks: string;
      }[];
    }[];
  };
}): Promise<void> {
  const res = await fetch(`${BASE}/add-record`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
}
