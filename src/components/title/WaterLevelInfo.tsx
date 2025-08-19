import { useWaterLevelStation } from "@/lib/hooks/useWaterLevel";
import {
  Box,
  Chip,
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
import { WaterLevelStation } from "@/lib/models/WaterLevel";
import { Line } from "react-chartjs-2";
import {
  CategoryScale,
  Chart,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
} from "chart.js";
import { AreaChart } from "@mui/icons-material";

Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Filler);

export default function WaterLevelInfo() {
  const theme = useTheme();
  const [waterLevelDialogOpen, setWaterLevelDialogOpen] = useState(false);
  const {
    data: station,
    isLoading: isLoadingWaterLevel,
    error: errorWaterLevel,
  } = useWaterLevelStation();

  if (isLoadingWaterLevel) {
    return <CircularProgress />;
  }
  if (errorWaterLevel) {
    return <Typography>Error loading water level</Typography>;
  }
  if (!station) {
    return <Typography>No water level data available</Typography>;
  }

  const lastMeasurement = station?.timeseries[station.timeseries.length - 1];

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: "1fr min-content min-content",
          whiteSpace: "nowrap",
          alignItems: "center",
          flexGrow: 1,
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <Box sx={{ height: "40px", minWidth: 0 }}>
          <Line
            data={{
              labels: [
                ...station.timeseries.map((ts) => ts.value),
                ...station?.timeseriesForecast.map((ts) => ts.value),
              ],
              datasets: [
                {
                  data: station?.timeseries.map((ts) => ts.value),

                  borderColor: theme.palette.primary.main,
                  backgroundColor: theme.palette.primary.light + "40", // 25% opacity
                  fill: true, // Fill to zero baseline
                  pointRadius: 0,
                  borderWidth: 2,
                },
                {
                  data: [
                    ...station.timeseries.map(() => null),
                    ...station?.timeseriesForecast.map((ts) => ts.value),
                  ],
                  borderColor: theme.palette.secondary.main,
                  backgroundColor: theme.palette.secondary.light + "40", // 25% opacity
                  fill: true,
                  pointRadius: 0,
                  borderWidth: 2,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  display: false,
                },
                y: {
                  display: false,
                  beginAtZero: true,
                },
              },
              elements: {
                line: {
                  tension: 0.1,
                },
              },
            }}
          />
        </Box>
        <Typography variant="body2" pl={"24px"}>
          {lastMeasurement.value ?? "N/A"} cm
        </Typography>
        <div>
          <IconButton onClick={() => setWaterLevelDialogOpen(true)}>
            <InfoOutlineIcon />
          </IconButton>
        </div>
      </Box>
      <WaterLevelDialog
        waterLevelDataset={station}
        open={waterLevelDialogOpen}
        onClose={() => setWaterLevelDialogOpen(false)}
      />
    </>
  );
}

type WaterLevelDialogProps = {
  waterLevelDataset?: WaterLevelStation;
  open: boolean;
  onClose: () => void;
};

function WaterLevelDialog({
  waterLevelDataset,
  open,
  onClose,
}: WaterLevelDialogProps) {
  const theme = useTheme();

  const lastMeasurement =
    waterLevelDataset?.timeseries[waterLevelDataset.timeseries.length - 1];

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
                  {lastMeasurement?.timestamp
                    ? new Date(lastMeasurement?.timestamp).toLocaleString(
                        undefined,
                        {
                          hour12: false,
                        }
                      )
                    : "N/A"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Station</TableCell>
                <TableCell>
                  {waterLevelDataset?.longname
                    ? waterLevelDataset?.longname
                    : "N/A"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Source</TableCell>
                <TableCell>
                  <a
                    href="https://www.pegelonline.wsv.de/gast/pegelinformationen?scrollPosition=0&gewaesser=ELBE"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: theme.palette.primary.main }}
                  >
                    PEGEL ONLINE
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
