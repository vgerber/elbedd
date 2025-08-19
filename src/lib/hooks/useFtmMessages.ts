import { useQuery } from "@tanstack/react-query";
import {
  Configuration,
  ElwisFtmQueryResponse,
  FairwayTransferMessagesApi,
  SearchFtmMessagesFtmSearchPostRequest,
} from "elwis-api";

async function fetchFtmMessages(): Promise<ElwisFtmQueryResponse> {
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

  return await ftmApi.searchFtmMessagesFtmSearchPost(queryParameters);
}

export function useFtmMessages() {
  return useQuery<ElwisFtmQueryResponse>({
    queryKey: ["searchFtmMessagesFtmSearchPost", "Elbe"],
    queryFn: fetchFtmMessages,
    staleTime: 1000 * 60 * 5, // 5 minutes (shorter than cache since water level changes more frequently)
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
