import { useWaterLevel } from "@/lib/hooks/useWaterLevel";
import { useWaterMeasurements } from "@/lib/hooks/useWaterMeasurements";
import { WaterMeasurement } from "@/lib/models/WaterMeasurement";
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import InfoOutlineIcon from "@mui/icons-material/InfoOutline";
import { useState } from "react";
import { WaterLevelDataset } from "@/lib/models/WaterLevel";
export function MetaTitleBar() {
  return (
    <Paper>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr min-content min-content min-content",
          gap: 2,
          padding: 2,
          alignItems: "center",
        }}
      >
        <Typography>Elbe DD (0km - 100km)</Typography>
        <WaterLevelBagdes />
        <Divider orientation="vertical" />
        <WaterMeasurementBadges />
      </Box>
    </Paper>
  );
}

function WaterLevelBagdes() {
  const [waterLevelDialogOpen, setWaterLevelDialogOpen] = useState(false);
  const {
    data: waterLevel,
    isLoading: isLoadingWaterLevel,
    error: errorWaterLevel,
  } = useWaterLevel();

  if (isLoadingWaterLevel) {
    return <Typography>Loading...</Typography>;
  }
  if (errorWaterLevel) {
    return <Typography>Error loading water level</Typography>;
  }
  if (!waterLevel) {
    return <Typography>No water level data available</Typography>;
  }

  function getChipColor(waterLevelState: string) {
    switch (waterLevelState) {
      case "low":
        return "default";
      case "medium":
        return "success";
      case "high":
        return "error";
    }
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          whiteSpace: "nowrap",
          alignItems: "center",
        }}
      >
        <Typography variant="body2">{waterLevel.currentLevel} cm</Typography>
        <Typography variant="body2">
          {waterLevel.currentFlow ? `${waterLevel.currentFlow} m³/s` : ""}
        </Typography>
        {waterLevel.waterLevelState && (
          <Chip
            color={getChipColor(waterLevel.waterLevelState)}
            label={waterLevel.waterLevelState}
          />
        )}
        <IconButton onClick={() => setWaterLevelDialogOpen(true)}>
          <InfoOutlineIcon />
        </IconButton>
      </Box>
      <WaterLevelDialog
        waterLevelDataset={waterLevel}
        open={waterLevelDialogOpen}
        onClose={() => setWaterLevelDialogOpen(false)}
      />
    </>
  );
}

type WaterLevelDialogProps = {
  waterLevelDataset?: WaterLevelDataset;
  open: boolean;
  onClose: () => void;
};

function WaterLevelDialog({
  waterLevelDataset,
  open,
  onClose,
}: WaterLevelDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Water Level</DialogTitle>
      <DialogContent>
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Last measurement</TableCell>
                <TableCell>
                  {waterLevelDataset?.measurementTime
                    ? new Date(
                        waterLevelDataset?.measurementTime
                      ).toLocaleString(undefined, {
                        hour12: false,
                      })
                    : "N/A"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Station</TableCell>
                <TableCell>
                  {waterLevelDataset?.station.longname
                    ? waterLevelDataset?.station.longname
                    : "N/A"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
}

function WaterMeasurementBadges() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const {
    data: measurements,
    isLoading: isLoadingMeasurements,
    error: errorMeasurements,
  } = useWaterMeasurements();

  if (isLoadingMeasurements) {
    return <Typography>Loading...</Typography>;
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
        }}
      >
        <Typography variant="body2">
          {displayMeasurement.airTemperature} °C
        </Typography>
        <Typography variant="body2">
          {displayMeasurement.waterTemperature} °C
        </Typography>
        <Typography variant="body2">
          {displayMeasurement.turbidity} TE/F
        </Typography>
        <IconButton onClick={() => setDialogOpen(true)}>
          <InfoOutlineIcon />
        </IconButton>
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
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
}
