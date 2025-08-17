"use client";

import { useQuery } from "@tanstack/react-query";
import { WaterLevelDataset } from "../models/WaterLevel";

/**
 * Fetches water level data from the API
 */
export async function fetchWaterLevel(): Promise<WaterLevelDataset> {
  const response = await fetch("/api/level");

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to fetch water level data: ${response.status} ${
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
 * React Query hook to fetch water level data
 * Uses the API endpoint with caching
 */
export function useWaterLevel() {
  return useQuery<WaterLevelDataset>({
    queryKey: ["waterLevel"],
    queryFn: fetchWaterLevel,
    staleTime: 1000 * 60 * 5, // 5 minutes (shorter than cache since water level changes more frequently)
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to get the current water level value
 */
export function useCurrentWaterLevel() {
  const { data, ...queryResult } = useWaterLevel();

  return {
    ...queryResult,
    data: data?.currentLevel,
    trend: data?.levelTrend,
    measurementTime: data?.measurementTime,
  };
}

/**
 * Hook to get the current flow rate
 */
export function useCurrentFlow() {
  const { data, ...queryResult } = useWaterLevel();

  return {
    ...queryResult,
    data: data?.currentFlow,
    trend: data?.flowTrend,
    measurementTime: data?.measurementTime,
  };
}

/**
 * Hook to get the current water temperature
 */
export function useCurrentWaterTemperature() {
  const { data, ...queryResult } = useWaterLevel();

  return {
    ...queryResult,
    data: data?.currentTemperature,
    measurementTime: data?.measurementTime,
  };
}

/**
 * Hook to get station information
 */
export function useStationInfo() {
  const { data, ...queryResult } = useWaterLevel();

  return {
    ...queryResult,
    data: data?.station,
  };
}
