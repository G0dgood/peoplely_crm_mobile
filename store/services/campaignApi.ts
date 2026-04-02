import { baseUrl } from "@/shared/baseUrl";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface CreateCampaignRequest {
  name: string;
  description?: string;
  userId?: string;
  timeZone?: string;
  industry?: string;
  businessSize?: string;
  [key: string]: any;
}

export interface CreateCampaignResponse {
  message: string;
  campaign?: any;
}

export const campaignApi = createApi({
  reducerPath: "campaignApi",
  tagTypes: ["Campaign"],
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    createCampaign: builder.mutation<
      CreateCampaignResponse,
      CreateCampaignRequest
    >({
      query: (data) => ({
        url: "api/v1/campaign",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Campaign"],
    }),
    getCampaign: builder.query<any, string>({
      query: (id) => `api/v1/campaign/${id}`,
      providesTags: ["Campaign"],
    }),
  }),
});

export const { 
  useGetCampaignQuery,
} = campaignApi;
