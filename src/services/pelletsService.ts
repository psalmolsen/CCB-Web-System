import { fetchApi } from "./apiClient";

export async function getPelletsTabsFn(): Promise<string[]> {
  return fetchApi<string[]>("/api/pellets/tabs");
}

export async function getPelletsDataFn({ data: tabName }: { data: string }): Promise<any[]> {
  const query = tabName ? `?tab=${encodeURIComponent(tabName)}` : "";
  return fetchApi<any[]>(`/api/pellets/data${query}`);
}

export async function addPelletsRecordFn({ data }: { data: any }): Promise<{ success: boolean }> {
  await fetchApi<null>("/api/pellets/add-record", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return { success: true };
}
