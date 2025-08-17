import { Card, CardContent, Typography } from "@mui/material";
import { ElwisFtmItem } from "elwis-api";

type FtmMessageCardProps = {
  message: ElwisFtmItem;
};

export function FtmMessageCard({ message }: FtmMessageCardProps) {
  const values = message.values;
  return (
    <Card>
      <CardContent>
        <Typography>{message.subjectCode}</Typography>
        <Typography>{message.contents}</Typography>
        {values.map((value, index) => (
          <Typography key={index}>
            {value.fairwaySection?.geoObject.coordinate
              .map((coord) => `${coord.lat}, ${coord._long}`)
              .join(" ---- ")}
            {" ## "}- {value.fairwaySection?.geoObject.name} -{" "}
            {value.fairwaySection?.geoObject.id
              .map((id) => ` ${id.sectionHectometer / 10}km`)
              .join(" - ")}
          </Typography>
        ))}

        {message.validityPeriod.start && (
          <Typography>{message.validityPeriod.start.toISOString()}</Typography>
        )}
        {message.validityPeriod.end && (
          <Typography>{message.validityPeriod.end.toISOString()}</Typography>
        )}
      </CardContent>
    </Card>
  );
}
