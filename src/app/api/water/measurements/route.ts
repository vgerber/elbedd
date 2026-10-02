import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import {
  WaterMeasurement,
  WaterMeasurementDataset,
  COLUMN_HEADERS,
  parseNumericValue,
  parseDateTime,
} from "@/lib/models/WaterMeasurement";

const CACHE_FILE_PATH = path.join(process.cwd(), "cache", "measurements.json");
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes in milliseconds

/**
 * API route to fetch water measurements XLS file, parse it, and serve as JSON with local caching
 * Downloads from https://www.wasser.sachsen.de/stationen/download/SM.xlsx
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
          "Using cached JSON file, age:",
          Math.round(fileAge / 1000),
          "seconds"
        );
        shouldDownload = false;
      } else {
        console.log(
          "Cached JSON file is too old, age:",
          Math.round(fileAge / 1000),
          "seconds"
        );
      }
    } else {
      console.log("No cached JSON file found, downloading and parsing...");
    }

    let jsonData: WaterMeasurementDataset;

    if (shouldDownload) {
      // Download fresh XLS data
      const response = await fetch(
        "https://www.wasser.sachsen.de/stationen/download/SM.xlsx",
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            Accept:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,*/*",
            "Accept-Language": "en-US,en;q=0.9",
            "Cache-Control": "no-cache",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch data: ${response.status} ${response.statusText}`
        );
      }

      const arrayBuffer = await response.arrayBuffer();

      // Parse XLS data to JSON
      jsonData = parseExcelData(arrayBuffer);

      // Save parsed JSON to cache
      try {
        // Ensure downloads directory exists
        const downloadsDir = path.dirname(CACHE_FILE_PATH);
        if (!fs.existsSync(downloadsDir)) {
          fs.mkdirSync(downloadsDir, { recursive: true });
        }

        // Write JSON data to cache
        fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(jsonData, null, 2));
        console.log("JSON data cached successfully");
      } catch (cacheError) {
        console.error("Failed to cache JSON data:", cacheError);
        // Continue even if caching fails
      }
    } else {
      // Read from JSON cache
      const jsonString = fs.readFileSync(CACHE_FILE_PATH, "utf8");
      jsonData = JSON.parse(jsonString);
      // Convert fetchedAt string back to Date object
      jsonData.fetchedAt = new Date(jsonData.fetchedAt);
    }

    // Return the JSON data with appropriate headers
    return NextResponse.json(jsonData, {
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
    console.error("Error fetching water measurements:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch water measurements",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Converts ArrayBuffer to WaterMeasurementDataset
 * Updated for the new SM.xlsx format with 10-minute intervals
 */
function parseExcelData(arrayBuffer: ArrayBuffer): WaterMeasurementDataset {
  // Parse the Excel file
  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON array
  const jsonData: (string | number)[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
  });

  // Resolve column indices from the header row (row 0)
  const headers = (jsonData[0] ?? []).map((header) => String(header).trim());
  const columnIndex = (name: string) => {
    const index = headers.findIndex((header) => header.startsWith(name));
    if (index === -1) {
      throw new Error(`Column "${name}" not found in measurements file`);
    }
    return index;
  };
  const column = Object.fromEntries(
    Object.entries(COLUMN_HEADERS).map(([key, name]) => [
      key,
      columnIndex(name),
    ])
  ) as Record<keyof typeof COLUMN_HEADERS, number>;

  // Station name is part of every row in the new format
  const stationColumn = headers.indexOf("Station");
  const stationName =
    (stationColumn !== -1 && jsonData[1]?.[stationColumn]
      ? String(jsonData[1][stationColumn])
      : undefined) || "Schmilka";

  // Parse measurements starting from row 1 (index 1) - row 0 contains headers
  const measurements: WaterMeasurement[] = [];

  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || row.length === 0) continue;

    const datetimeValue = row[column.DATETIME];
    if (!datetimeValue) continue; // Skip rows without datetime

    const measurement: WaterMeasurement = {
      datetime: parseDateTime(String(datetimeValue)) || String(datetimeValue),
      globalRadiation: parseNumericValue(row[column.GLOBAL_RADIATION]),
      conductivity: parseNumericValue(row[column.CONDUCTIVITY]),
      airTemperature: parseNumericValue(row[column.AIR_TEMPERATURE]),
      ammoniumN: parseNumericValue(row[column.AMMONIUM_N]),
      nitrateN: parseNumericValue(row[column.NITRATE_N]),
      oxygenContent: parseNumericValue(row[column.OXYGEN_CONTENT]),
      oxygenSaturation: parseNumericValue(row[column.OXYGEN_SATURATION]),
      phValue: parseNumericValue(row[column.PH_VALUE]),
      sak254: parseNumericValue(row[column.SAK_254]),
      turbidity: parseNumericValue(row[column.TURBIDITY]),
      windSpeed: parseNumericValue(row[column.WIND_SPEED]),
      windDirection: parseNumericValue(row[column.WIND_DIRECTION]),
      waterTemperature: parseNumericValue(row[column.WATER_TEMPERATURE]),
      totalChlorophyll: parseNumericValue(row[column.TOTAL_CHLOROPHYLL]),
    };

    measurements.push(measurement);
  }

  // Rows in SM.xlsx are not strictly chronological, consumers expect ascending order
  measurements.sort(
    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
  );

  return {
    stationName,
    measurements,
    fetchedAt: new Date(),
    totalRecords: measurements.length,
  };
}
