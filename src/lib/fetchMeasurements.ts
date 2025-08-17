import { WaterMeasurementDataset } from "./models/WaterMeasurement";

/**
 * Alternative function that fetches pre-parsed JSON data from the API
 * This is more efficient as it avoids client-side XLSX parsing and uses server-side caching
 */
export async function fetchMeasurements(): Promise<WaterMeasurementDataset> {
  const response = await fetch("/api/water-measurements");

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to fetch measurements: ${response.status} ${
        response.statusText
      }. ${errorData.message || ""}`
    );
  }

  const data = await response.json();

  // Convert the fetchedAt string back to a Date object
  return {
    ...data,
    fetchedAt: new Date(data.fetchedAt),
  };
}
