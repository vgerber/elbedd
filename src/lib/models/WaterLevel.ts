/**
 * Represents water level and current data from Pegelonline API
 * Source: https://www.pegelonline.wsv.de/webservices/rest-api/v2/
 */

export interface WaterLevel {
  /** Station UUID */
  uuid: string;

  /** Station number */
  number: string;

  /** Station short name */
  shortname: string;

  /** Station long name */
  longname: string;

  /** Kilometer mark on the waterway */
  km: number;

  /** Agency responsible for the station */
  agency: string;

  /** Longitude coordinate */
  longitude: number;

  /** Latitude coordinate */
  latitude: number;

  /** Water body information */
  water: {
    shortname: string;
    longname: string;
  };

  /** Time series data */
  timeseries: WaterTimeseries[];
}

export interface CurrentMeasurement {
  /** Timestamp of the measurement */
  timestamp: string;

  /** Measured value */
  value: number;

  /** State relative to mean low/high water (only for water level) */
  stateMnwMhw?: string;

  /** State relative to navigational low/high water (only for water level) */
  stateNswHsw?: string;

  /** Trend (1 = rising, 0 = steady, -1 = falling) - not always present */
  trend?: number;

  /** State message code - not always present */
  stateNr?: number;
}

export interface GaugeZero {
  /** Unit of gauge zero */
  unit: string;

  /** Gauge zero value */
  value: number;

  /** Valid from date */
  validFrom: string;
}

export interface WaterTimeseries {
  /** Time series short name */
  shortname: string;

  /** Time series long name */
  longname: string;

  /** Unit of measurement */
  unit: string;

  /** Measurement interval in minutes */
  equidistance: number;

  /** Current measurement */
  currentMeasurement?: CurrentMeasurement;

  /** Gauge zero information (only for water level) */
  gaugeZero?: GaugeZero;
}

export interface WaterLevelDataset {
  /** Station information */
  station: WaterLevel;

  /** Current water level in cm */
  currentLevel?: number;

  /** Current flow rate in m³/s */
  currentFlow?: number;

  /** Current water temperature in °C */
  currentTemperature?: number;

  /** Timestamp of current measurements */
  measurementTime?: string;

  /** Trend for water level */
  levelTrend?: number;

  /** Trend for flow rate */
  flowTrend?: number;

  /** Water level state (low, normal, high) */
  waterLevelState?: string;

  /** Gauge zero information */
  gaugeZero?: GaugeZero;

  /** Date when the data was fetched */
  fetchedAt: Date;
}

/**
 * Extracts current measurements from station data
 */
export function extractCurrentMeasurements(
  station: WaterLevel
): WaterLevelDataset {
  let currentLevel: number | undefined;
  let currentFlow: number | undefined;
  let currentTemperature: number | undefined;
  let measurementTime: string | undefined;
  let levelTrend: number | undefined;
  let flowTrend: number | undefined;
  let waterLevelState: string | undefined;
  let gaugeZero: GaugeZero | undefined;

  // Extract data from timeseries
  station.timeseries?.forEach((series) => {
    if (!series.currentMeasurement) return;

    const measurement = series.currentMeasurement;

    // Determine measurement type based on shortname
    if (series.shortname === "W") {
      // Water level (Wasserstand)
      currentLevel = measurement.value;
      levelTrend = measurement.trend;
      measurementTime = measurement.timestamp;
      waterLevelState = measurement.stateMnwMhw || measurement.stateNswHsw;
      gaugeZero = series.gaugeZero;
    } else if (series.shortname === "Q") {
      // Flow rate (Abfluss)
      currentFlow = measurement.value;
      flowTrend = measurement.trend;
      if (!measurementTime) {
        measurementTime = measurement.timestamp;
      }
    } else if (series.shortname === "WT") {
      // Water temperature
      currentTemperature = measurement.value;
      if (!measurementTime) {
        measurementTime = measurement.timestamp;
      }
    }
  });

  return {
    station,
    currentLevel,
    currentFlow,
    currentTemperature,
    measurementTime,
    levelTrend,
    flowTrend,
    waterLevelState,
    gaugeZero,
    fetchedAt: new Date(),
  };
}
