/**
 * Represents water level and current data from Pegelonline API
 * Source: https://www.pegelonline.wsv.de/webservices/rest-api/v2/
 */

export interface WaterLevelStation {
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
  timeseriesForecast: WaterTimeseries[];

  fetchedAt: Date;
}

export interface WaterTimeseries {
  timestamp: string;
  value: number;
}
