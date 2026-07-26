import { fetchApi } from "./apiClient";

export async function getTabsFn(): Promise<string[]> {
  return fetchApi<string[]>("/api/inventory/tabs");
}

export async function getMaterialsFn({ data: tabName }: { data: string }): Promise<any[]> {
  const query = tabName ? `?tab=${encodeURIComponent(tabName)}` : "";
  return fetchApi<any[]>(`/api/inventory${query}`);
}

export async function stockInFn({ data }: { data: { tabName: string; rowNumber: number; qty: number } }): Promise<{ success: boolean }> {
  await fetchApi<null>("/api/inventory/stock-in", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return { success: true };
}

export async function stockOutFn({ data }: { data: { tabName: string; rowNumber: number; qty: number; day: number } }): Promise<{ success: boolean }> {
  await fetchApi<null>("/api/inventory/stock-out", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return { success: true };
}

export async function editMaterialFn({ data }: { data: { tabName: string; rowNumber: number; values: any } }): Promise<{ success: boolean }> {
  await fetchApi<null>(`/api/inventory/material/${encodeURIComponent(data.rowNumber)}`, {
    method: "PUT",
    body: JSON.stringify({ tabName: data.tabName, values: data.values }),
  });
  return { success: true };
}

export async function addMaterialFn({ data }: { data: { tabName: string; values: any } }): Promise<{ success: boolean }> {
  await fetchApi<null>("/api/inventory/material", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return { success: true };
}

export async function provisionCurrentMonthFn(): Promise<{ created: string | null }> {
  return fetchApi<{ created: string | null }>("/api/inventory/provision-month", {
    method: "POST",
  });
}
