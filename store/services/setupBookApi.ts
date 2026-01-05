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
    getSetupBooks: builder.query<
      SetupBook[],
      { page?: number; limit?: number; search?: string } | void
    >({
      query: (params) => {
        if (params) {
          const { page, limit, search } = params;
          let queryString = "api/v1/setup-books?";
          if (page) queryString += `page=${page}&`;
          if (limit) queryString += `limit=${limit}&`;
          if (search) queryString += `search=${search}&`;
          return queryString;
        }
        return "api/v1/setup-books";
      },
      providesTags: ["SetupBook"],
    }),
    getSetupBookById: builder.query<SetupBook, string>({
      query: (id) => `api/v1/setup-books/${id}`,
      providesTags: (result, error, id) => [{ type: "SetupBook", id }],
    }),
    getSetupBookByLineOfBusinessId: builder.query<
      SetupBookResponse,
      { id: string; page?: number; limit?: number; search?: string }
    >({
      query: ({ id, page, limit, search }) => {
        const params = new URLSearchParams();
        if (page) params.append("page", page.toString());
        if (limit) params.append("limit", limit.toString());
        if (search) params.append("search", search);

        const queryString = params.toString();
        return `api/v1/setup-books/${id}${
          queryString ? `?${queryString}` : ""
        }`;
      },
      providesTags: ["SetupBook"],
    }),
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
    updateSetupBook: builder.mutation<SetupBook, UpdateSetupBookRequest>({
      query: ({ id, data }) => ({
        url: `api/v1/setup-books/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SetupBook", id },
        "SetupBook",
      ],
    }),
    updateSetupBookRecords: builder.mutation<
      any,
      UpdateSetupBookRecordsRequest
    >({
      query: ({ lineOfBusinessId, data }) => ({
        url: `api/v1/setup-books/${lineOfBusinessId}/records`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["SetupBook"],
    }),
    deleteSetupBookRecords: builder.mutation<
      any,
      DeleteSetupBookRecordsRequest
    >({
      query: ({ lineOfBusinessId, id }) => ({
        url: `api/v1/setup-books/${lineOfBusinessId}/records`,
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["SetupBook"],
    }),
    deleteManySetupBookRecords: builder.mutation<
      any,
      DeleteManySetupBookRecordsRequest
    >({
      query: ({ lineOfBusinessId, ids }) => ({
        url: `api/v1/setup-books/${lineOfBusinessId}/records/many`,
        method: "DELETE",
        body: { ids },
      }),
      invalidatesTags: ["SetupBook"],
    }),
    deleteSetupBook: builder.mutation<{ success: boolean; id: string }, string>(
      {
        query: (id) => ({
          url: `api/v1/setup-books/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["SetupBook"],
      }
    ),
  }),
});

export const {
  useGetSetupBooksQuery,
  useGetSetupBookByIdQuery,
  useGetSetupBookByLineOfBusinessIdQuery,
  useGetSetupBookBySearchIdQuery,
  useCreateSetupBookMutation,
  useUpdateSetupBookMutation,
  useUpdateSetupBookRecordsMutation,
  useDeleteSetupBookRecordsMutation,
  useDeleteManySetupBookRecordsMutation,
  useDeleteSetupBookMutation,
} = setupBookApi;
