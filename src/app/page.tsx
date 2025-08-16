"use client";

import { Card, CardContent, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import {
  Configuration,
  ElwisFtmItem,
  FairwayTransferMessagesApi,
} from "elwis-api";

export default function Home() {
  const apiConfiguration = new Configuration({
    basePath: "https://elwis.vgerber.io",
  });

  const ftmApi = new FairwayTransferMessagesApi(apiConfiguration);

  const { data, error, isLoading } = useQuery({
    queryKey: ["searchFtmMessagesFtmSearchPost", "Elbe"],
    queryFn: async () =>
      ftmApi.searchFtmMessagesFtmSearchPost({
        ftmQuery: {
          fairwayName: "Elbe",
          hectometerStart: 0,
          hectometerEnd: 1000,
        },
      }),
  });

  if (isLoading) {
    return "Loading...";
  }

  if (!data) {
    return "No data";
  }

  if (error) {
    return `Error: ${error.message}`;
  }

  const messages = data.messages;
  return (
    <>
      {messages.map((message) => (
        <MessageCard key={message.ntsNumber.number} message={message} />
      ))}
    </>
  );
}

type MessageCardProps = {
  message: ElwisFtmItem;
};

function MessageCard({ message }: MessageCardProps) {
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
