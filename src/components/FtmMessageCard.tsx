import { Card, CardContent, Stack, Typography, useTheme } from "@mui/material";
import { ElwisFtmItem, NtsNumber } from "elwis-api";

type FtmMessageCardProps = {
  message: ElwisFtmItem;
  selected?: boolean;
  onSelectMessage?: (messageId: NtsNumber) => void;
};

export function FtmMessageCard({
  message,
  selected,
  onSelectMessage,
}: FtmMessageCardProps) {
  const values = message.values;
  const theme = useTheme();
  const color = selected
    ? theme.palette.primary.main
    : theme.palette.secondary.main;
  return (
    <Card
      onClick={() => onSelectMessage?.(message.ntsNumber)}
      sx={{
        cursor: "pointer",
        borderLeft: selected ? `4px solid ${color}` : "4px solid white",
      }}
    >
      <CardContent>
        <Typography variant="caption">{message.subjectCode}</Typography>
        <Typography variant="body2">{message.contents}</Typography>

        <Stack
          direction={"row"}
          gap={2}
          justifyContent={"space-between"}
          marginTop={2}
        >
          {message.validityPeriod.start && (
            <Typography>
              {message.validityPeriod.start.toDateString()}{" "}
            </Typography>
          )}

          {message.validityPeriod.end && (
            <Typography>
              {message.validityPeriod.end.toDateString()}{" "}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
