import { useWaterLevel } from "@/lib/hooks/useWaterLevel";
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
import { WaterLevelDataset } from "@/lib/models/WaterLevel";

export default function WaterLevelInfo() {
  const [waterLevelDialogOpen, setWaterLevelDialogOpen] = useState(false);
  const {
    data: waterLevel,
    isLoading: isLoadingWaterLevel,
    error: errorWaterLevel,
  } = useWaterLevel();

  if (isLoadingWaterLevel) {
    return <CircularProgress />;
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
          justifyContent: "space-between",
          flexGrow: 1,
        }}
      >
        <Typography variant="body2" pl={"24px"}>
          {waterLevel.currentLevel} cm
        </Typography>
        <Typography variant="body2" pl={"24px"}>
          {waterLevel.currentFlow ? `${waterLevel.currentFlow} m³/s` : ""}
        </Typography>
        <div>
          {waterLevel.waterLevelState && (
            <Chip
              color={getChipColor(waterLevel.waterLevelState)}
              label={waterLevel.waterLevelState}
            />
          )}
          <IconButton onClick={() => setWaterLevelDialogOpen(true)}>
            <InfoOutlineIcon />
          </IconButton>
        </div>
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
  const theme = useTheme();
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
