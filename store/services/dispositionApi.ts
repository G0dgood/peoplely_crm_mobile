import { baseUrl } from '@/shared/baseUrl';
import { getAuthToken } from '@/utils/authToken';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface CreateDispositionRequest {
    fillDisposition: any[];
    customerId?: string;
    agentId?: string;
    campaignId?: string;
    timestamp: string;
    [key: string]: any;
}

export interface CreateDispositionResponse {
    message: string;
    disposition?: any;
}

export interface GetDispositionsRequest {
    campaignId: string;
    page?: number;
    limit?: number;
}

export interface GetDispositionsByCustomerRequest {
    campaignId: string;
    customerId: string;
    page?: number;
    limit?: number;
}

export interface GetDispositionsByAgentIdRequest {
    campaignId: string;
    agentId: string;
    page?: number;
    limit?: number;
}

export interface GetDispositionsReportRequest {
    campaignId: string;
    startDate?: string;
    endDate?: string;
}

export interface GetDispositionsByAgentReportRequest {
    campaignId: string;
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
        getDispositionsByCampaign: builder.query<any, GetDispositionsRequest>({
            query: ({ campaignId, page = 1, limit = 20 }) => 
                `api/v1/dispositions/${campaignId}?page=${page}&limit=${limit}`,
            providesTags: ['Disposition'],
        }),
        getDispositionsByCustomer: builder.query<any, GetDispositionsByCustomerRequest>({
            query: ({ campaignId, customerId, page = 1, limit = 20 }) => 
                `api/v1/dispositions/${campaignId}?search=${customerId}&page=${page}&limit=${limit}`,
            providesTags: ['Disposition'],
        }),
        getDispositionsByAgentId: builder.query<any, GetDispositionsByAgentIdRequest>({
            query: ({ campaignId, agentId, page = 1, limit = 20 }) => 
                `api/v1/dispositions/${campaignId}?search=${agentId}&page=${page}&limit=${limit}`,
            providesTags: ['Disposition'],
        }),
        getDispositionsByCampaignReport: builder.query<any, GetDispositionsReportRequest>({
            query: ({ campaignId, startDate, endDate }) => 
                `api/v1/dispositions/${campaignId}/report?startDate=${startDate}&endDate=${endDate}`,
            providesTags: ['Disposition'],
        }),
        getDispositionsByAgentReport: builder.query<any, GetDispositionsByAgentReportRequest>({
            query: ({ campaignId, agentId, page = 1, limit = 20, startDate , endDate  }) => 
                `api/v1/dispositions/${campaignId}/agent/${agentId}/report?page=${page}&limit=${limit}&startDate=${startDate}&endDate=${endDate}`,
            providesTags: ['Disposition'],
        }),
    }),
});

export const {
    useCreateDispositionMutation,
    useGetDispositionsByCampaignQuery,
    useGetDispositionsByCustomerQuery,
    useGetDispositionsByAgentIdQuery,
    useGetDispositionsByCampaignReportQuery,
    useGetDispositionsByAgentReportQuery,
} = dispositionApi;
