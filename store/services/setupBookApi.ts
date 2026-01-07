import { baseUrl } from "@/shared/baseUrl";
import { getAuthToken } from "@/utils/authToken";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface SetupBook {
  id: string;
  [key: string]: any;
}

export interface CreateSetupBookRequest {
  companyId: string;
  lineOfBusinessId: string;
  file: File;
}

export interface UpdateSetupBookRequest {
  id: string;
  data: {
    [key: string]: any;
  };
}

export interface SetupBookResponse {
  message: string;
  data: SetupBook[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UpdateSetupBookRecordsRequest {
  lineOfBusinessId: string;
  data: any;
}

export interface DeleteSetupBookRecordsRequest {
  lineOfBusinessId: string;
  id: string;
}

export interface DeleteManySetupBookRecordsRequest {
  lineOfBusinessId: string;
  ids: string[];
}

export const setupBookApi = createApi({
  reducerPath: "setupBookApi",
  tagTypes: ["SetupBook"],
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const stateToken = (getState() as any).auth?.token;
      const token = stateToken ?? getAuthToken();
      headers.set("authorization", `Bearer ${token}`); 
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getSetupBookBySearchId: builder.query<
      SetupBookResponse,
      {
        lineOfBusinessId: string;
        searchId: string;
        page?: number;
        limit?: number;
        search?: string;
      }
    >({
      query: ({ lineOfBusinessId, searchId, page, limit, search }) => {
        const params = new URLSearchParams();
        if (page) params.append("page", page.toString());
        if (limit) params.append("limit", limit.toString());
        if (search) params.append("search", search);

        const queryString = params.toString();
        return `api/v1/setup-books/${lineOfBusinessId}/record/${searchId}${
          queryString ? `?${queryString}` : ""
        }`;
      },
      providesTags: ["SetupBook"],
    }),
    createSetupBook: builder.mutation<SetupBook, FormData>({
      query: (data) => ({
        url: "api/v1/setup-books",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SetupBook"],
    }),
  
    
  }),
});

export const { 
  useGetSetupBookBySearchIdQuery,
  useCreateSetupBookMutation 
} = setupBookApi;
