import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import {
  WaterLevel,
  WaterLevelDataset,
  extractCurrentMeasurements,
} from "@/lib/models/WaterLevel";

const ELBE_STATION = "70272185-b2b3-4178-96b8-43bea330dcae"; // DD
const STATION_URL = `https://www.pegelonline.wsv.de/webservices/rest-api/v2/stations/${ELBE_STATION}.json?includeTimeseries=true&includeCurrentMeasurement=true`;
const CACHE_FILE_PATH = path.join(process.cwd(), "cache", "water-level.json");
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes in milliseconds

/**
 * API route to fetch water level and current data with local caching
 * Downloads from Pegelonline API for Dresden station
 * Caches the parsed JSON data locally and reuses it if it's less than 10 minutes old
 */
export async function GET() {
  try {
    let shouldDownload = true;

    // Check if cached JSON file exists and is still valid
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const stats = fs.statSync(CACHE_FILE_PATH);
      const fileAge = Date.now() - stats.mtime.getTime();

      if (fileAge < CACHE_DURATION_MS) {
        console.log(
          "Using cached water level data, age:",
          Math.round(fileAge / 1000),
          "seconds"
        );
        shouldDownload = false;
      } else {
        console.log(
          "Cached water level data is too old, age:",
          Math.round(fileAge / 1000),
          "seconds"
        );
      }
    } else {
      console.log("No cached water level data found, downloading...");
    }

    let levelData: WaterLevelDataset;

    if (shouldDownload) {
      // Download fresh data from Pegelonline API
      const response = await fetch(STATION_URL, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ElbeDD/1.0)",
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch data: ${response.status} ${response.statusText}`
        );
      }

      const stationData: WaterLevel = await response.json();

      // Extract current measurements
      levelData = extractCurrentMeasurements(stationData);

      // Save parsed JSON to cache
      try {
        // Ensure downloads directory exists
        const downloadsDir = path.dirname(CACHE_FILE_PATH);
        if (!fs.existsSync(downloadsDir)) {
          fs.mkdirSync(downloadsDir, { recursive: true });
        }

        // Write JSON data to cache
        fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(levelData, null, 2));
        console.log("Water level data cached successfully");
      } catch (cacheError) {
        console.error("Failed to cache water level data:", cacheError);
        // Continue even if caching fails
      }
    } else {
      // Read from JSON cache
      const jsonString = fs.readFileSync(CACHE_FILE_PATH, "utf8");
      levelData = JSON.parse(jsonString);
      // Convert fetchedAt string back to Date object
      levelData.fetchedAt = new Date(levelData.fetchedAt);
    }

    // Return the JSON data with appropriate headers
    return NextResponse.json(levelData, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=600", // Cache for 10 minutes
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
        "X-Cache-Status": shouldDownload ? "MISS" : "HIT",
      },
    });
  } catch (error) {
    console.error("Error fetching water level data:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch water level data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
