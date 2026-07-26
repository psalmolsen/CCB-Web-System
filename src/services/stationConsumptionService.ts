import { fetchApi } from "./apiClient";

export async function getStationConsumptionRecordsFn(): Promise<any[]> {
  return fetchApi<any[]>("/api/station-consumption/records");
}

export async function getMaterialsFromCurrentMonthFn(): Promise<any[]> {
  return fetchApi<any[]>("/api/station-consumption/materials/current");
}

export async function addStationConsumptionRecordFn({ data }: { data: any }): Promise<{ success: boolean }> {
  await fetchApi<null>("/api/station-consumption/add-record", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return { success: true };
}
