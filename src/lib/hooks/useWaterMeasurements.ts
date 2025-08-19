"use client";

import { useQuery } from "@tanstack/react-query";
import { WaterMeasurementDataset } from "../models/WaterMeasurement";

/**
 * Alternative function that fetches pre-parsed JSON data from the API
 * This is more efficient as it avoids client-side XLSX parsing and uses server-side caching
 */
export async function fetchMeasurements(): Promise<WaterMeasurementDataset> {
  const response = await fetch("/api/water/measurements");

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
/**
 * React Query hook to fetch water measurements
 * Uses the efficient JSON API endpoint with caching
 */
export function useWaterMeasurements() {
  return useQuery<WaterMeasurementDataset>({
    queryKey: ["waterMeasurements"],
    queryFn: fetchMeasurements, // Uses the JSON API with server-side caching
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
