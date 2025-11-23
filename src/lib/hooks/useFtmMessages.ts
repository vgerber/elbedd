import { useQuery } from "@tanstack/react-query";
import {
  Configuration,
  ElwisFtmQueryResponse,
  FairwayTransferMessagesApi,
  SearchFtmMessagesFtmSearchPostRequest,
} from "elwis-api";

async function fetchFtmMessages(
  validTodayOnly: boolean
): Promise<ElwisFtmQueryResponse> {
  const apiConfiguration = new Configuration({
    basePath: "https://elwis.vgerber.io",
  });

  const ftmApi = new FairwayTransferMessagesApi(apiConfiguration);
  const queryParameters = {
    ftmQuery: {
      fairwayName: "Elbe",
      hectometerStart: 0,
      hectometerEnd: 1000,
    },
  } as SearchFtmMessagesFtmSearchPostRequest;

  const queryResponse = await ftmApi.searchFtmMessagesFtmSearchPost(
    queryParameters
  );

  if (validTodayOnly) {
    const now = new Date();
    queryResponse.messages = queryResponse.messages.filter((message) => {
      const start = message.validityPeriod.start;
      const end = message.validityPeriod.end;

      if (start && now < start) {
        return false;
      }
      if (end && now > end) {
        return false;
      }
      return true;
    });
  }
  return queryResponse;
}

export function useFtmMessages(validTodayOnly: boolean = true) {
  return useQuery<ElwisFtmQueryResponse>({
    queryKey: ["searchFtmMessagesFtmSearchPost", "Elbe"],
    queryFn: () => fetchFtmMessages(validTodayOnly),
    staleTime: 1000 * 60 * 5, // 5 minutes (shorter than cache since water level changes more frequently)
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
