import { baseUrl } from "@/shared/baseUrl";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface CreateLineOfBusinessRequest {
  name: string;
  description?: string;
  userId?: string;
  timeZone?: string;
  industry?: string;
  businessSize?: string;
  [key: string]: any;
}

export interface CreateLineOfBusinessResponse {
  message: string;
  lineOfBusiness?: any;
}

export const lineOfBusinessApi = createApi({
  reducerPath: "lineOfBusinessApi",
  tagTypes: ["LineOfBusiness"],
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
    createLineOfBusiness: builder.mutation<
      CreateLineOfBusinessResponse,
      CreateLineOfBusinessRequest
    >({
      query: (data) => ({
        url: "api/v1/line-of-business",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["LineOfBusiness"],
    }),
    getLineOfBusiness: builder.query<any, string>({
      query: (id) => `api/v1/line-of-business/${id}`,
      providesTags: ["LineOfBusiness"],
    }),
  }),
});

export const { 
  useGetLineOfBusinessQuery,
} = lineOfBusinessApi;
