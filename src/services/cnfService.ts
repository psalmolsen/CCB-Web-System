// Replaces src/lib/cnf-server-functions.ts (createServerFn calls)

const BASE = "/api/cnf";

export async function getCnfTabsFn(): Promise<string[]> {
  const res = await fetch(`${BASE}/tabs`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getCnfItemsFn({ data: tabName }: { data: string }): Promise<any[]> {
  const res = await fetch(`${BASE}/items?tab=${encodeURIComponent(tabName)}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function cnfStockInFn({ data }: { data: { tabName: string; rowNumber: number; qty: number } }): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE}/stock-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function cnfStockOutFn({ data }: { data: { tabName: string; rowNumber: number; qty: number; day: number } }): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE}/stock-out`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function cnfEditItemFn({ data }: { data: { tabName: string; rowNumber: number; values: any } }): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE}/edit-item`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function addNewCnfFn({ data }: { data: { tabName: string; brand: string; parts: { name: string; variants: string[] }[] } }): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE}/add-new`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
