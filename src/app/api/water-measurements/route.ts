import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import {
  WaterMeasurement,
  WaterMeasurementDataset,
  COLUMN_MAPPING,
  parseNumericValue,
} from "@/lib/models/WaterMeasurement";

const CACHE_FILE_PATH = path.join(process.cwd(), "cache", "SM.json");
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes in milliseconds

/**
 * API route to fetch water measurements XLS file, parse it, and serve as JSON with local caching
 * Downloads from https://www.wasser.sachsen.de/stationen/download/SM.xls
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
        "https://www.wasser.sachsen.de/stationen/download/SM.xls",
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            Accept: "application/vnd.ms-excel,*/*",
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
 * Updated for the new SM.xls format with 10-minute intervals
 */
function parseExcelData(arrayBuffer: ArrayBuffer): WaterMeasurementDataset {
  // Parse the Excel file
  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  // Get the first worksheet (should be 'Werte_Schmilka')
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON array
  const jsonData: (string | number)[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
  });

  // Extract station name from sheet name
  const stationName = sheetName || "Schmilka";

  // Parse measurements starting from row 1 (index 1) - row 0 contains headers
  const measurements: WaterMeasurement[] = [];

  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || row.length === 0) continue;

    const datetimeValue = row[COLUMN_MAPPING.DATETIME];
    if (!datetimeValue) continue; // Skip rows without datetime

    const measurement: WaterMeasurement = {
      datetime: String(datetimeValue),
      globalRadiation: parseNumericValue(row[COLUMN_MAPPING.GLOBAL_RADIATION]),
      conductivity: parseNumericValue(row[COLUMN_MAPPING.CONDUCTIVITY]),
      airTemperature: parseNumericValue(row[COLUMN_MAPPING.AIR_TEMPERATURE]),
      ammoniumN: parseNumericValue(row[COLUMN_MAPPING.AMMONIUM_N]),
      nitrateN: parseNumericValue(row[COLUMN_MAPPING.NITRATE_N]),
      oxygenContent: parseNumericValue(row[COLUMN_MAPPING.OXYGEN_CONTENT]),
      oxygenSaturation: parseNumericValue(
        row[COLUMN_MAPPING.OXYGEN_SATURATION]
      ),
      phValue: parseNumericValue(row[COLUMN_MAPPING.PH_VALUE]),
      sak254: parseNumericValue(row[COLUMN_MAPPING.SAK_254]),
      turbidity: parseNumericValue(row[COLUMN_MAPPING.TURBIDITY]),
      windSpeed: parseNumericValue(row[COLUMN_MAPPING.WIND_SPEED]),
      windDirection: parseNumericValue(row[COLUMN_MAPPING.WIND_DIRECTION]),
      waterTemperature: parseNumericValue(
        row[COLUMN_MAPPING.WATER_TEMPERATURE]
      ),
      totalChlorophyll: parseNumericValue(
        row[COLUMN_MAPPING.TOTAL_CHLOROPHYLL]
      ),
    };

    measurements.push(measurement);
  }

  return {
    stationName,
    measurements,
    fetchedAt: new Date(),
    totalRecords: measurements.length,
  };
}
