import { fetchApi } from "./apiClient";

export async function getOringTabsFn(): Promise<string[]> {
  return fetchApi<string[]>("/api/orings/tabs");
}

export async function getOringDataFn({ data: tabName }: { data: string }): Promise<any[]> {
  const query = tabName ? `?tab=${encodeURIComponent(tabName)}` : "";
  return fetchApi<any[]>(`/api/orings/data${query}`);
}

export async function addOringRecordFn({ data }: { data: any }): Promise<void> {
  await fetchApi<null>("/api/orings/add-record", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
