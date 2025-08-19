import { useWaterMeasurements } from "@/lib/hooks/useWaterMeasurements";
import { WaterMeasurement } from "@/lib/models/WaterMeasurement";
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import InfoOutlineIcon from "@mui/icons-material/InfoOutline";
import { useState } from "react";
import AirIcon from "@mui/icons-material/Air";
import WaterIcon from "@mui/icons-material/Water";

export default function WaterQualityInfo() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const {
    data: measurements,
    isLoading: isLoadingMeasurements,
    error: errorMeasurements,
  } = useWaterMeasurements();

  if (isLoadingMeasurements) {
    return <CircularProgress />;
  }
  if (errorMeasurements) {
    return <Typography>Error loading data</Typography>;
  }
  if (
    !measurements ||
    !measurements.measurements ||
    measurements.measurements.length === 0
  ) {
    return <Typography>No data available</Typography>;
  }

  const latestMeasurement =
    measurements.measurements[measurements.measurements.length - 1];

  let yesterdayMeasurement: WaterMeasurement | undefined = undefined;
  for (let i = measurements.measurements.length - 2; i >= 0; i--) {
    const measurement = measurements.measurements[i];
    if (
      new Date().getTime() - new Date(measurement.datetime).getTime() >=
      24 * 60 * 60 * 1000 // 24h
    ) {
      yesterdayMeasurement = measurement;
      break;
    }
  }

  const displayMeasurement = yesterdayMeasurement || latestMeasurement;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          whiteSpace: "nowrap",
          alignItems: "center",
          justifyContent: "space-between",
          flexGrow: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <AirIcon />
          <Typography variant="body2">
            {displayMeasurement.airTemperature} °C
          </Typography>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <WaterIcon />
          <Typography variant="body2">
            {displayMeasurement.waterTemperature} °C
          </Typography>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="body2">
            {displayMeasurement.turbidity} TE/F
          </Typography>
          <IconButton onClick={() => setDialogOpen(true)}>
            <InfoOutlineIcon />
          </IconButton>
        </div>
      </Box>
      <MeasurementQualityDialog
        displayMeasurement={displayMeasurement}
        lastMeasurement={latestMeasurement}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}

type MeasurementQualityDialogProps = {
  displayMeasurement: WaterMeasurement;
  lastMeasurement: WaterMeasurement;
  open: boolean;
  onClose: () => void;
};

function MeasurementQualityDialog({
  displayMeasurement,
  lastMeasurement,
  open,
  onClose,
}: MeasurementQualityDialogProps) {
  const theme = useTheme();
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Measurement Quality</DialogTitle>
      <DialogContent>
        <Typography variant="body2" gutterBottom>
          The displayed measurement is the last valid one from the last 24
          hours. If no measurement is available, the latest measurement is
          shown.
        </Typography>
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Last measurement</TableCell>
                <TableCell>
                  {new Date(lastMeasurement.datetime).toLocaleString(
                    undefined,
                    { hour12: false }
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Display</TableCell>
                <TableCell>
                  {new Date(displayMeasurement?.datetime).toLocaleString(
                    undefined,
                    { hour12: false }
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Source</TableCell>
                <TableCell>
                  <a
                    href="https://www.wasser.sachsen.de/messstation-schmilka-elbe-rechts-fluss-km-726-alte-kilometrierung-4-18339.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: theme.palette.primary.main }}
                  >
                    Messstation Schmilka
                  </a>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
}
