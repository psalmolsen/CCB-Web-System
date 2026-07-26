import { fetchApi } from "./apiClient";

export async function getCnfTabsFn(): Promise<string[]> {
  return fetchApi<string[]>("/api/cnf/tabs");
}

export async function getCnfItemsFn({ data: tabName }: { data: string }): Promise<any[]> {
  const query = tabName ? `?tab=${encodeURIComponent(tabName)}` : "";
  return fetchApi<any[]>(`/api/cnf${query}`);
}

export async function cnfStockInFn({ data }: { data: { tabName: string; rowNumber: number; qty: number } }): Promise<{ success: boolean }> {
  await fetchApi<null>("/api/cnf/stock-in", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return { success: true };
}

export async function cnfStockOutFn({ data }: { data: { tabName: string; rowNumber: number; qty: number; day: number } }): Promise<{ success: boolean }> {
  await fetchApi<null>("/api/cnf/stock-out", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return { success: true };
}

export async function cnfEditItemFn({ data }: { data: { tabName: string; rowNumber: number; values: any } }): Promise<{ success: boolean }> {
  await fetchApi<null>("/api/cnf/edit-item", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return { success: true };
}

export async function addNewCnfFn({ data }: { data: { tabName: string; brand: string; parts: { name: string; variants: string[] }[] } }): Promise<{ success: boolean }> {
  await fetchApi<null>("/api/cnf/add-new", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return { success: true };
}
