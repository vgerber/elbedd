"use client";

import { FtmMessageList } from "@/components/FtmMessageList";
import { MetaTitleBar } from "@/components/MetaTitleBar";
import { useWaterLevel } from "@/lib/hooks/useWaterLevel";
import { Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import {
  Configuration,
  FairwayTransferMessagesApi,
  NtsNumber,
} from "elwis-api";
import dynamic from "next/dynamic";
import { useState } from "react";

const FtmMessageMap = dynamic(() => import("@/components/FtmMessageMap"), {
  ssr: false,
  loading: () => <div>Loading map...</div>,
});

export default function Home() {
  const apiConfiguration = new Configuration({
    basePath: "https://elwis.vgerber.io",
  });
  const [selectedMessageId, setSelectedMessageId] = useState<NtsNumber | null>(
    null
  );

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

  const {
    data: waterLevelData,
    error: waterLevelError,
    isLoading: isLoadingWaterLevel,
  } = useWaterLevel();

  if (isLoading || isLoadingWaterLevel) {
    return "Loading...";
  }

  if (!data || !waterLevelData) {
    return "No data";
  }

  if (error || waterLevelError) {
    return `Error: ${error?.message || waterLevelError?.message}`;
  }

  const messages = data.messages;
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "auto 1fr",
        gap: 2,
        padding: 2,
        height: "100%", // Adjust for header height
      }}
    >
      <div style={{ gridColumn: "1 / 3" }}>
        <MetaTitleBar />
      </div>
      <FtmMessageMap
        messages={messages}
        station={waterLevelData?.station}
        onSelectMessage={setSelectedMessageId}
        selectedMessageId={selectedMessageId ?? undefined}
      />
      <FtmMessageList
        messages={messages}
        selectedMessageId={selectedMessageId ?? undefined}
        onSelectMessage={setSelectedMessageId}
      />
    </Box>
  );
}
