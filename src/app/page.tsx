"use client";

import { FtmMessageList } from "@/components/FtmMessageList";
import { FtmMessageMap } from "@/components/FtmMessageMap";
import { MetaTitleBar } from "@/components/MetaTitleBar";
import { Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Configuration, FairwayTransferMessagesApi } from "elwis-api";

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
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 2,
        margin: 2,
      }}
    >
      <div style={{ gridColumn: "1 / 3" }}>
        <MetaTitleBar />
      </div>
      <FtmMessageMap messages={messages} />
      <FtmMessageList messages={messages} />
    </Box>
  );
}
