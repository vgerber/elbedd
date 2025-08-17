"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { WaterMeasurementDataset } from "../models/WaterMeasurement";
import { fetchMeasurements } from "@/lib/fetchMeasurements";

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

/**
 * Hook to get the latest measurement
 */
export function useLatestMeasurement() {
  const { data: allData, ...queryResult } = useWaterMeasurements();

  const latestMeasurement = useMemo(() => {
    return allData?.measurements[0]; // Assuming data is sorted with latest first
  }, [allData]);

  return {
    ...queryResult,
    data: latestMeasurement,
  };
}
