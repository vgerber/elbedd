"use client";

import { FtmMessageList } from "@/components/FtmMessageList";
import { MetaTitleBar } from "@/components/title/MetaTitleBar";
import { Box, Stack, useMediaQuery, useTheme } from "@mui/material";
import { NtsNumber } from "elwis-api";
import dynamic from "next/dynamic";
import { useState } from "react";

const FtmMessageMap = dynamic(() => import("@/components/map/FtmMessageMap"), {
  ssr: false,
  loading: () => <div>Loading map...</div>,
});

export default function Home() {
  const [selectedMessageId, setSelectedMessageId] = useState<NtsNumber | null>(
    null
  );
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Box
      component={"main"}
      sx={{
        display: "grid",
        gridTemplateColumns: matches ? "1fr 1fr" : "1fr",
        gridTemplateRows: matches ? "auto 1fr" : "auto 1fr min-content",
        gap: 2,
        padding: 2,
        height: "100%", // Adjust for header height
        maxWidth: "100%",
        minWidth: 0,
        overflowX: "hidden",
      }}
    >
      <div style={{ gridColumn: matches ? "1 / 3" : "1", maxWidth: "100%" }}>
        <MetaTitleBar />
      </div>
      <FtmMessageMap
        onSelectMessage={setSelectedMessageId}
        selectedMessageId={selectedMessageId ?? undefined}
      />
      <div style={{ justifySelf: "center" }}>
        <FtmMessageList
          selectedMessageId={selectedMessageId ?? undefined}
          onSelectMessage={setSelectedMessageId}
        />
      </div>
      <Box
        sx={{
          gridColumn: matches ? "1 / 3" : "1",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Stack></Stack>
      </Box>
    </Box>
  );
}
