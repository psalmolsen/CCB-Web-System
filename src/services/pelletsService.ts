// Replaces src/lib/pellets-server-functions.ts (createServerFn calls)

const BASE = "/api/pellets";

export async function getPelletsTabsFn(): Promise<string[]> {
  const res = await fetch(`${BASE}/tabs`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getPelletsDataFn({ data: tabName }: { data: string }): Promise<any[]> {
  const res = await fetch(`${BASE}/data?tab=${encodeURIComponent(tabName)}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function addPelletsRecordFn({ data }: {
  data: {
    tabName: string;
    dateGroups: {
      date: string;
      shifts: { sack: string; time: string; good: number; reject: number; kgs: string }[];
    }[];
  };
}): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE}/add-record`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
