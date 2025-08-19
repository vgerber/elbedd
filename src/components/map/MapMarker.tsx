import { useTheme } from "@mui/material";
import { CircleMarker, Polyline } from "react-leaflet";
import { ElwisFtmItem, GeoObject } from "elwis-api";

export type GeoObjectItem = {
  geoObject: GeoObject;
  message: ElwisFtmItem;
};

type MapMarkerProps = {
  item: GeoObjectItem;
  selected?: boolean;
  onSelectMessage?: () => void;
};

export default function MapMarker({
  item,
  selected,
  onSelectMessage,
}: MapMarkerProps) {
  const coordinates = item.geoObject.coordinate.map((coord) =>
    convertCoordsToArray({ lat: coord.lat, long: coord._long })
  );
  const theme = useTheme();
  const color = selected
    ? theme.palette.primary.main
    : theme.palette.error.main;

  if (coordinates.length === 1) {
    return (
      <CircleMarker
        radius={20}
        center={coordinates[0]}
        color={color}
        eventHandlers={{
          click: () => (onSelectMessage ? onSelectMessage() : {}),
        }}
      />
    );
  }

  if (coordinates.length > 1) {
    return (
      <Polyline
        positions={coordinates}
        pathOptions={{
          weight: 25,
          color,
          opacity: 0.5,
          lineCap: "square",
        }}
        eventHandlers={{
          click: () => (onSelectMessage ? onSelectMessage() : {}),
        }}
      />
    );
  }
}

/**
 * Converts coordinate strings like "51 03.269 N" or "13 44.451 E" to decimal numbers
 * @param coordString - Coordinate string in format "DD MM.mmm N/S/E/W"
 * @returns Decimal coordinate number
 */
function convertCoordinateToDecimal(coordString: string): number {
  if (!coordString || typeof coordString !== "string") {
    return 0;
  }

  const parts = coordString.trim().split(" ");
  if (parts.length !== 3) {
    return 0;
  }

  const degrees = parseInt(parts[0], 10);
  const minutes = parseFloat(parts[1]);
  const direction = parts[2].toUpperCase();

  if (isNaN(degrees) || isNaN(minutes)) {
    return 0;
  }

  // Convert to decimal degrees
  let decimal = degrees + minutes / 60;

  // Apply direction (negative for South and West)
  if (direction === "S" || direction === "W") {
    decimal = -decimal;
  }

  return decimal;
}

/**
 * Converts coordinate object to [lat, lng] array for react-leaflet
 * @param coords - Object with lat and long properties
 * @returns [latitude, longitude] array
 */
function convertCoordsToArray(coords: {
  lat: string;
  long: string;
}): [number, number] {
  const lat = convertCoordinateToDecimal(coords.lat);
  const lng = convertCoordinateToDecimal(coords.long);
  return [lat, lng];
}
