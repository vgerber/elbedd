/**
 * Represents a single measurement record from the water quality monitoring station
 * Updated for the new SM.xls format with 10-minute intervals
 */
export interface WaterMeasurement {
  /** Date and time of the measurement in ISO format (converted from DD.MM.YYYY HH:mm:ss) */
  datetime: string;

  /** Global radiation in J/cm²min */
  globalRadiation?: number;

  /** Electrical conductivity in µS/cm */
  conductivity?: number;

  /** Air temperature in °C */
  airTemperature?: number;

  /** Ammonium nitrogen concentration in µg/l */
  ammoniumN?: number;

  /** Nitrate nitrogen concentration in mg/l */
  nitrateN?: number;

  /** Dissolved oxygen content in mg/l */
  oxygenContent?: number;

  /** Oxygen saturation in % */
  oxygenSaturation?: number;

  /** pH value (dimensionless) */
  phValue?: number;

  /** Spectral absorption coefficient at 254nm in 1/m */
  sak254?: number;

  /** Turbidity in TE/F */
  turbidity?: number;

  /** Wind speed in km/h */
  windSpeed?: number;

  /** Wind direction in degrees from North */
  windDirection?: number;

  /** Water temperature in °C */
  waterTemperature?: number;

  /** Total chlorophyll concentration in µg/l */
  totalChlorophyll?: number;
}

/**
 * Represents the complete dataset with metadata
 */
export interface WaterMeasurementDataset {
  /** Name of the monitoring station */
  stationName: string;

  /** Array of all measurements */
  measurements: WaterMeasurement[];

  /** Date when the data was fetched */
  fetchedAt: Date;

  /** Total number of measurements */
  totalRecords: number;
}

/**
 * Column mapping for the SM.xls data
 * Based on the header row: DATUM, Globalstrahlung, Leitf, LT, NH4-N, NO3-N, O2-Gehalt, O2-Sättigung, pH-Wert, SAK 254nm, Trübung, Windgeschwindigkeit, Windrichtung, WT, Gesamtchlorophyll
 */
export const COLUMN_MAPPING = {
  DATETIME: 0, // DATUM
  GLOBAL_RADIATION: 1, // Globalstrahlung (J/cm²min)
  CONDUCTIVITY: 2, // Leitf (µS/cm)
  AIR_TEMPERATURE: 3, // LT (°C)
  AMMONIUM_N: 4, // NH4-N (µg/l)
  NITRATE_N: 5, // NO3-N (mg/l)
  OXYGEN_CONTENT: 6, // O2-Gehalt (mg/l)
  OXYGEN_SATURATION: 7, // O2-Sättigung (%)
  PH_VALUE: 8, // pH-Wert
  SAK_254: 9, // SAK 254nm (1/m)
  TURBIDITY: 10, // Trübung (TE/F)
  WIND_SPEED: 11, // Windgeschwindigkeit (km/h)
  WIND_DIRECTION: 12, // Windrichtung (° Nord)
  WATER_TEMPERATURE: 13, // WT (°C)
  TOTAL_CHLOROPHYLL: 14, // Gesamtchlorophyll (µg/l)
} as const;

/**
 * Helper function to parse numeric values, handling special cases like "<30" and German decimal notation (comma)
 */
export function parseNumericValue(
  value: string | number | undefined | null
): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "number") {
    return value;
  }

  const stringValue = String(value).trim();

  // Handle special cases like "<30"
  if (stringValue.startsWith("<")) {
    const numericPart = stringValue.substring(1);
    // Replace German decimal comma with dot
    const normalizedPart = numericPart.replace(",", ".");
    const parsed = parseFloat(normalizedPart);
    return isNaN(parsed) ? undefined : parsed;
  }

  // Replace German decimal comma with dot
  const normalizedValue = stringValue.replace(",", ".");
  const parsed = parseFloat(normalizedValue);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Helper function to parse datetime in DD.MM.YYYY HH:mm:ss format and convert to ISO string
 */
export function parseDateTime(dateTimeString: string): string | null {
  if (!dateTimeString || typeof dateTimeString !== "string") {
    return null;
  }

  // Format: "02.08.2025 00:10:00"
  const parts = dateTimeString.trim().split(" ");
  if (parts.length !== 2) {
    return null;
  }

  const datePart = parts[0];
  const timePart = parts[1];

  // Parse date part
  const dateElements = datePart.split(".");
  if (dateElements.length !== 3) {
    return null;
  }

  const day = parseInt(dateElements[0], 10);
  const month = parseInt(dateElements[1], 10);
  const year = parseInt(dateElements[2], 10);

  // Parse time part
  const timeElements = timePart.split(":");
  if (timeElements.length !== 3) {
    return null;
  }

  const hours = parseInt(timeElements[0], 10);
  const minutes = parseInt(timeElements[1], 10);
  const seconds = parseInt(timeElements[2], 10);

  if (
    isNaN(day) ||
    isNaN(month) ||
    isNaN(year) ||
    isNaN(hours) ||
    isNaN(minutes) ||
    isNaN(seconds)
  ) {
    return null;
  }

  // Create date (month is 0-indexed in JavaScript Date)
  const date = new Date(year, month - 1, day, hours, minutes, seconds);

  // Return ISO string
  return date.toISOString();
}

/**
 * Helper function to parse datetime and return Date object (for internal use)
 */
export function parseDateTimeToDate(dateTimeString: string): Date | null {
  if (!dateTimeString || typeof dateTimeString !== "string") {
    return null;
  }

  // If it's already an ISO string, parse it directly
  if (dateTimeString.includes("T")) {
    const date = new Date(dateTimeString);
    return isNaN(date.getTime()) ? null : date;
  }

  // Format: "02.08.2025 00:10:00"
  const parts = dateTimeString.trim().split(" ");
  if (parts.length !== 2) {
    return null;
  }

  const datePart = parts[0];
  const timePart = parts[1];

  // Parse date part
  const dateElements = datePart.split(".");
  if (dateElements.length !== 3) {
    return null;
  }

  const day = parseInt(dateElements[0], 10);
  const month = parseInt(dateElements[1], 10);
  const year = parseInt(dateElements[2], 10);

  // Parse time part
  const timeElements = timePart.split(":");
  if (timeElements.length !== 3) {
    return null;
  }

  const hours = parseInt(timeElements[0], 10);
  const minutes = parseInt(timeElements[1], 10);
  const seconds = parseInt(timeElements[2], 10);

  if (
    isNaN(day) ||
    isNaN(month) ||
    isNaN(year) ||
    isNaN(hours) ||
    isNaN(minutes) ||
    isNaN(seconds)
  ) {
    return null;
  }

  // Create date (month is 0-indexed in JavaScript Date)
  return new Date(year, month - 1, day, hours, minutes, seconds);
}

/**
 * Helper function to parse date in DD.MM.YYYY format (legacy function)
 */
export function parseDate(dateString: string): Date | null {
  if (!dateString || typeof dateString !== "string") {
    return null;
  }

  // If it contains time, use parseDateTimeToDate
  if (dateString.includes(" ")) {
    return parseDateTimeToDate(dateString);
  }

  const parts = dateString.trim().split(".");
  if (parts.length !== 3) {
    return null;
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return null;
  }

  // Create date (month is 0-indexed in JavaScript Date)
  return new Date(year, month - 1, day);
}
