import { baseUrl } from '@/shared/baseUrl';
import { getAuthToken } from '@/utils/authToken';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface NotificationUser {
    name: string;
    avatar?: string;
    icon?: string;
}

export interface Notification {
    id: string;
    type: 'follow' | 'like' | 'join_request' | 'group_activity' | 'comment' | 'welcome' | 'notification' | 'status_created' | 'role_updated' | 'custom_alert';
    user: NotificationUser;
    message: string;
    timestamp: string;
    isRead: boolean;
    createdAt?: string;
    data?: any;
}

export interface CreateNotificationRequest {
    type: string;
    message: string;
    sender: {
        name: string;
        avatar?: string;
    };
    recipient: {
        lineOfBusinessId?: string;
        userId?: string;
    };
    data?: any;
}

export interface GetNotificationsResponse {
    message: string;
    notifications: Notification[];
}

export const notificationApi = createApi({
    reducerPath: 'notificationApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl,
        prepareHeaders: (headers, { getState }) => {
              const stateToken = (getState() as any).auth?.token;
                 const token = stateToken ?? getAuthToken();
                 headers.set("authorization", `Bearer ${token}`); 
            return headers;
        },
    }),
    tagTypes: ['Notification'],
    endpoints: (builder) => ({
        getNotificationsByLineOfBusinessId: builder.query<GetNotificationsResponse, string>({
            query: (lineOfBusinessId) => `api/v1/notifications?lineOfBusinessId=${lineOfBusinessId}`,
            providesTags: ['Notification'],
        }),
        markNotificationAsRead: builder.mutation<any, string>({
            query: (id) => ({
                url: `api/v1/notifications/${id}/read`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Notification'],
        }),
        markAllNotificationsAsRead: builder.mutation<any, void>({
            query: () => ({
                url: 'api/v1/notifications/read-all',
                method: 'PATCH',
            }),
            invalidatesTags: ['Notification'],
        }),
        createNotification: builder.mutation<any, CreateNotificationRequest>({
            query: (notificationData) => ({
                url: 'api/v1/notifications',
                method: 'POST',
                body: notificationData,
            }),
            invalidatesTags: ['Notification'],
        }),
        deleteNotification: builder.mutation<any, string>({
            query: (id) => ({
                url: `api/v1/notifications/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Notification'],
        }),
    }),
});

export const { 
    useGetNotificationsByLineOfBusinessIdQuery,
    useMarkNotificationAsReadMutation,
    useMarkAllNotificationsAsReadMutation,
    useCreateNotificationMutation,
    useDeleteNotificationMutation
} = notificationApi;
