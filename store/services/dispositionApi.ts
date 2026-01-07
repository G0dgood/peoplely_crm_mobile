import { baseUrl } from '@/shared/baseUrl';
import { getAuthToken } from '@/utils/authToken';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface CreateDispositionRequest {
    fillDisposition: any[];
    customerId?: string;
    agentId?: string;
    lineOfBusinessId?: string;
    timestamp: string;
    [key: string]: any;
}

export interface CreateDispositionResponse {
    message: string;
    disposition?: any;
}

export interface GetDispositionsRequest {
    lineOfBusinessId: string;
    page?: number;
    limit?: number;
}

export interface GetDispositionsByCustomerRequest {
    lineOfBusinessId: string;
    customerId: string;
    page?: number;
    limit?: number;
}

export interface GetDispositionsByAgentIdRequest {
    lineOfBusinessId: string;
    agentId: string;
    page?: number;
    limit?: number;
}

export interface GetDispositionsReportRequest {
    lineOfBusinessId: string;
    startDate?: string;
    endDate?: string;
}

export interface GetDispositionsByAgentReportRequest {
    lineOfBusinessId: string;
    agentId: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
}

export const dispositionApi = createApi({
    reducerPath: 'dispositionApi',
    tagTypes: ['Disposition'],
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
        createDisposition: builder.mutation<CreateDispositionResponse, CreateDispositionRequest>({
            query: (data) => ({
                url: 'api/v1/dispositions',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Disposition'],
        }),
        getDispositionsByLineOfBusiness: builder.query<any, GetDispositionsRequest>({
            query: ({ lineOfBusinessId, page = 1, limit = 20 }) => 
                `api/v1/dispositions/${lineOfBusinessId}?page=${page}&limit=${limit}`,
            providesTags: ['Disposition'],
        }),
        getDispositionsByCustomer: builder.query<any, GetDispositionsByCustomerRequest>({
            query: ({ lineOfBusinessId, customerId, page = 1, limit = 20 }) => 
                `api/v1/dispositions/${lineOfBusinessId}?search=${customerId}&page=${page}&limit=${limit}`,
            providesTags: ['Disposition'],
        }),
        getDispositionsByAgentId: builder.query<any, GetDispositionsByAgentIdRequest>({
            query: ({ lineOfBusinessId, agentId, page = 1, limit = 20 }) => 
                `api/v1/dispositions/${lineOfBusinessId}?search=${agentId}&page=${page}&limit=${limit}`,
            providesTags: ['Disposition'],
        }),
        getDispositionsByLineOfBusinessReport: builder.query<any, GetDispositionsReportRequest>({
            query: ({ lineOfBusinessId, startDate, endDate }) => 
                `api/v1/dispositions/${lineOfBusinessId}/report?startDate=${startDate}&endDate=${endDate}`,
            providesTags: ['Disposition'],
        }),
        getDispositionsByAgentReport: builder.query<any, GetDispositionsByAgentReportRequest>({
            query: ({ lineOfBusinessId, agentId, page = 1, limit = 20, startDate , endDate  }) => 
                `api/v1/dispositions/${lineOfBusinessId}/agent/${agentId}/report?page=${page}&limit=${limit}&startDate=${startDate}&endDate=${endDate}`,
            providesTags: ['Disposition'],
        }),
    }),
});

export const {
    useCreateDispositionMutation,
    useGetDispositionsByLineOfBusinessQuery,
    useGetDispositionsByCustomerQuery,
    useGetDispositionsByAgentIdQuery,
    useGetDispositionsByLineOfBusinessReportQuery,
    useGetDispositionsByAgentReportQuery,
} = dispositionApi;
