import { FtmMessageCard } from "@/components/FtmMessageCard";
import { Stack } from "@mui/material";
import { ElwisFtmItem, NtsNumber } from "elwis-api";

type FtmMessageListProps = {
  messages: ElwisFtmItem[];
  selectedMessageId?: NtsNumber;
  onSelectMessage?: (messageId: NtsNumber) => void;
};

export function FtmMessageList({
  messages,
  selectedMessageId,
  onSelectMessage,
}: FtmMessageListProps) {
  return (
    <Stack gap={2}>
      {messages.map((message) => (
        <FtmMessageCard
          key={message.ntsNumber.number}
          message={message}
          selected={selectedMessageId === message.ntsNumber}
          onSelectMessage={() => onSelectMessage?.(message.ntsNumber)}
        />
      ))}
    </Stack>
  );
}
