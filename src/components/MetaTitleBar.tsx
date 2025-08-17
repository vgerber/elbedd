import { useWaterMeasurements } from "@/lib/hooks/useWaterMeasurements";
import { WaterMeasurement } from "@/lib/models/WaterMeasurement";
import { Box, Paper, Typography } from "@mui/material";

export function MetaTitleBar() {
  const { data: measurements, isLoading, error } = useWaterMeasurements();

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }
  if (error) {
    return <Typography>Error loading data</Typography>;
  }
  if (
    !measurements ||
    !measurements.measurements ||
    measurements.measurements.length === 0
  ) {
    return <Typography>No data available</Typography>;
  }

  return (
    <Paper>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr min-content",
          padding: 2,
        }}
      >
        <Typography>Elbe DD</Typography>
        <WaterMeasurementBadges
          measurement={
            measurements.measurements[measurements.measurements.length - 1]
          }
        />
      </Box>
    </Paper>
  );
}

type WaterMeasurementBadgesProps = {
  measurement: WaterMeasurement;
};

function WaterMeasurementBadges({ measurement }: WaterMeasurementBadgesProps) {
  return (
    <Box sx={{ display: "flex", gap: 2, whiteSpace: "nowrap" }}>
      <Typography variant="body2">{measurement.airTemperature} °C</Typography>
      <Typography variant="body2">{measurement.waterTemperature} °C</Typography>
      <Typography variant="body2">{measurement.turbidity} TE/F</Typography>
      <Typography variant="body2">{measurement.datetime} LU</Typography>
    </Box>
  );
}
