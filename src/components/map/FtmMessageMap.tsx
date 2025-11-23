"use client";
import { Box } from "@mui/material";
import { NtsNumber } from "elwis-api";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import MapMarker, { GeoObjectItem } from "@/components/map/MapMarker";
import { useFtmMessages } from "@/lib/hooks/useFtmMessages";
import { useWaterLevelStation } from "@/lib/hooks/useWaterLevel";

type FtmMessageMapProps = {
  selectedMessageId?: NtsNumber;
  onSelectMessage?: (messageId: NtsNumber) => void;
};

export default function FtmMessageMap({
  selectedMessageId,
  onSelectMessage,
}: FtmMessageMapProps) {
  const { data, isLoading: isLoadingMessages } = useFtmMessages(true);
  const { data: station, isLoading: isLoadingWaterLevel } =
    useWaterLevelStation();
  if (isLoadingMessages || isLoadingWaterLevel) {
    return <div>Loading messages...</div>;
  }
  if (!data || data.messages.length === 0) {
    return <div>No messages available</div>;
  }

  const { messages } = data;
  if (!station) {
    return <div>No water level station data available</div>;
  }

  const geoObjects: GeoObjectItem[] = messages.flatMap((message) => {
    return message.values.flatMap((value) => {
      const objects = [];
      if (value.fairwaySection) {
        const section = value.fairwaySection;
        objects.push({ geoObject: section.geoObject, message });
      }
      if (value.object) {
        const object = value.object;
        objects.push({ geoObject: object.geoObject, message });
      }
      return objects;
    });
  });

  return (
    <Box sx={{ minHeight: "300px" }}>
      <MapContainer
        center={[station.latitude, station.longitude]}
        zoom={13}
        style={{
          height: "100%",
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geoObjects.map((item, index) => (
          <MapMarker
            key={index}
            item={item}
            onSelectMessage={() => onSelectMessage?.(item.message.ntsNumber)}
            selected={selectedMessageId === item.message.ntsNumber}
          />
        ))}
      </MapContainer>
    </Box>
  );
}
