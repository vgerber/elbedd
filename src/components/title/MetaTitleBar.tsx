import {
  Box,
  Divider,
  IconButton,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import WaterLevelInfo from "@/components/title/WaterLevelInfo";
import WaterQualityInfo from "@/components/title/WaterQualityInfo";
import GitHubIcon from "@mui/icons-material/GitHub";
import { useRouter } from "next/navigation";

export function MetaTitleBar() {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("md"));
  const router = useRouter();

  if (!matches) {
    return (
      <Box gap={1} display={"grid"} gridTemplateRows={"1fr 1fr 1fr"}>
        <Paper sx={{ display: "flex", justifyContent: "center" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              px: 2,
              py: 1,
            }}
          >
            <Typography>Elbe DD (0km - 100km)</Typography>
            <IconButton
              onClick={() => router.push("https://github.com/vgerber/elbedd")}
            >
              <GitHubIcon />
            </IconButton>
          </Box>
        </Paper>
        <Paper>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              px: 2,
              py: 1,
            }}
          >
            <WaterLevelInfo />
          </Box>
        </Paper>
        <Paper>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              px: 2,
              py: 1,
            }}
          >
            <WaterQualityInfo />
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Paper>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr auto min-content min-content",
          gap: 2,
          padding: 2,
          alignItems: "center",
        }}
      >
        <Typography>Elbe DD (0km - 100km)</Typography>
        <WaterLevelInfo />
        <Divider orientation="vertical" />
        <WaterQualityInfo />
      </Box>
    </Paper>
  );
}
