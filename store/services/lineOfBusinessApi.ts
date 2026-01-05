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
    baseUrl: process.env.base_url,
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
    getLineOfBusinessByCompanyId: builder.query<any, string>({
      query: (companyId) => `api/v1/line-of-business/company/${companyId}`,
      providesTags: ["LineOfBusiness"],
    }),
    getLineOfBusinessByCompanyIdForheader: builder.query<any, string>({
      query: (companyId) =>
        `api/v1/line-of-business/company/${companyId}/header`,
      providesTags: ["LineOfBusiness"],
    }),
    updateLineOfBusiness: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `api/v1/line-of-business/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["LineOfBusiness"],
    }),
    deleteLineOfBusiness: builder.mutation<any, string>({
      query: (id) => ({
        url: `api/v1/line-of-business/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LineOfBusiness"],
    }),
  }),
});

export const {
  useCreateLineOfBusinessMutation,
  useGetLineOfBusinessQuery,
  useUpdateLineOfBusinessMutation,
  useDeleteLineOfBusinessMutation,
  useGetLineOfBusinessByCompanyIdQuery,
  useLazyGetLineOfBusinessByCompanyIdQuery,
  useGetLineOfBusinessByCompanyIdForheaderQuery,
} = lineOfBusinessApi;
