// Replaces src/lib/station-consumption-server-functions.ts (createServerFn calls)

const BASE = "/api/station-consumption";

export async function getStationConsumptionRecordsFn(): Promise<any[]> {
  const res = await fetch(`${BASE}/records`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getMaterialsFromCurrentMonthFn(): Promise<any[]> {
  const res = await fetch(`${BASE}/materials`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function addStationConsumptionRecordFn({ data }: { data: any }): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE}/add-record`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
