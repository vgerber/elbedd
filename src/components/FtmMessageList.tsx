import { FtmMessageCard } from "@/components/FtmMessageCard";
import { useFtmMessages } from "@/lib/hooks/useFtmMessages";
import { Stack } from "@mui/material";
import { NtsNumber } from "elwis-api";

type FtmMessageListProps = {
  selectedMessageId?: NtsNumber;
  onSelectMessage?: (messageId: NtsNumber) => void;
};

export function FtmMessageList({
  selectedMessageId,
  onSelectMessage,
}: FtmMessageListProps) {
  const { data, isLoading } = useFtmMessages(true);
  if (isLoading) {
    return <div>Loading messages...</div>;
  }

  if (!data || data.messages.length === 0) {
    return <div>No messages available</div>;
  }

  return (
    <Stack gap={2}>
      {data.messages.map((message) => (
        <FtmMessageCard
          key={`${message.ntsNumber.number}-${message.ntsNumber.serialNumber}-${message.ntsNumber.year}-${message.ntsNumber.organisation}`}
          message={message}
          selected={selectedMessageId === message.ntsNumber}
          onSelectMessage={() => onSelectMessage?.(message.ntsNumber)}
        />
      ))}
    </Stack>
  );
}
