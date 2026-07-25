// Replaces src/lib/server-functions.ts (createServerFn calls)
// These call the backend API which handles Google Sheets credentials server-side.

const BASE = "/api";

export async function getTabsFn(): Promise<string[]> {
  const res = await fetch(`${BASE}/tabs`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getMaterialsFn({ data: tabName }: { data: string }): Promise<any[]> {
  const res = await fetch(`${BASE}/materials?tab=${encodeURIComponent(tabName)}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function stockInFn({ data }: { data: { tabName: string; rowNumber: number; qty: number } }): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE}/stock-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function stockOutFn({ data }: { data: { tabName: string; rowNumber: number; qty: number; day: number } }): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE}/stock-out`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function editMaterialFn({ data }: { data: { tabName: string; rowNumber: number; values: any } }): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE}/edit-material`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function addMaterialFn({ data }: { data: { tabName: string; values: any } }): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE}/add-material`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function provisionCurrentMonthFn(): Promise<{ created: string | null }> {
  const res = await fetch(`${BASE}/provision-month`, { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
