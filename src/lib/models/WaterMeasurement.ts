/**
 * Represents a single measurement record from the water quality monitoring station
 * Updated for the new SM.xlsx format with 10-minute intervals
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
 * Column header names in the SM.xlsx data
 * Columns are looked up by header name since their order changed between file versions
 * Header row: Station, Datum, Ammonium-N (µg/l, Gesamtchlorophyll (µg/l), Globalstrahlung (J/cm²min), Leitfähigkeit (µS/cm), Lufttemperatur (°C), Nitrat-N (mg/l, pH-Wert, SAK (254nm) (1/m), Sauerstoffgehalt (mg/l), Sauerstoffsättigung (%), Trübung (TE/F), Wassertemperatur (°C), Windgeschwindigkeit (km/h), Windrichtung (° Nord)
 */
export const COLUMN_HEADERS = {
  DATETIME: "Datum",
  GLOBAL_RADIATION: "Globalstrahlung",
  CONDUCTIVITY: "Leitfähigkeit",
  AIR_TEMPERATURE: "Lufttemperatur",
  AMMONIUM_N: "Ammonium-N",
  NITRATE_N: "Nitrat-N",
  OXYGEN_CONTENT: "Sauerstoffgehalt",
  OXYGEN_SATURATION: "Sauerstoffsättigung",
  PH_VALUE: "pH-Wert",
  SAK_254: "SAK (254nm)",
  TURBIDITY: "Trübung",
  WIND_SPEED: "Windgeschwindigkeit",
  WIND_DIRECTION: "Windrichtung",
  WATER_TEMPERATURE: "Wassertemperatur",
  TOTAL_CHLOROPHYLL: "Gesamtchlorophyll",
} as const;

const SOURCE_TIME_ZONE = "Europe/Berlin";

/**
 * Returns the UTC offset of the source time zone at the given instant in milliseconds
 */
function getSourceTimeZoneOffset(instant: number): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SOURCE_TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(instant));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parseInt(parts.find((p) => p.type === type)?.value ?? "0", 10);
  const wallTime = Date.UTC(
    part("year"),
    part("month") - 1,
    part("day"),
    part("hour"),
    part("minute"),
    part("second")
  );
  return wallTime - Math.floor(instant / 1000) * 1000;
}

/**
 * Creates a Date from a wall-clock time in the source time zone (Europe/Berlin, incl. DST)
 * The measurement files contain German local time without an offset
 */
export function berlinTimeToDate(
  year: number,
  month: number,
  day: number,
  hours = 0,
  minutes = 0,
  seconds = 0
): Date {
  const wallTime = Date.UTC(year, month - 1, day, hours, minutes, seconds);
  // Offset may differ before and after the conversion around DST changes, so refine once
  let instant = wallTime - getSourceTimeZoneOffset(wallTime);
  instant = wallTime - getSourceTimeZoneOffset(instant);
  return new Date(instant);
}

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

  // Timestamps are German local time, independent of the server timezone
  const date = berlinTimeToDate(year, month, day, hours, minutes, seconds);

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

  // Timestamps are German local time, independent of the server timezone
  return berlinTimeToDate(year, month, day, hours, minutes, seconds);
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

  // Dates are German local time, independent of the server timezone
  return berlinTimeToDate(year, month, day);
}
