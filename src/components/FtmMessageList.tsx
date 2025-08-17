import { FtmMessageCard } from "@/components/FtmMessageCard";
import { Stack } from "@mui/material";
import { ElwisFtmItem } from "elwis-api";

type FtmMessageListProps = {
  messages: ElwisFtmItem[];
};

export function FtmMessageList({ messages }: FtmMessageListProps) {
  return (
    <Stack gap={2}>
      {messages.map((message) => (
        <FtmMessageCard key={message.ntsNumber.number} message={message} />
      ))}
    </Stack>
  );
}
