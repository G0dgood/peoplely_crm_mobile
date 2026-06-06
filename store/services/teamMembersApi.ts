import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "../../shared/baseUrl";

type TeamMemberLoginRequest = {
  userId: string;
  password: string;
};

type TeamMemberLoginResponse = any;
type TeamMemberLogoutRequest = {
  userId: string;
};
type TeamMemberLogoutResponse = any;
type CampaignResponse = any;
type StatusesByLobResponse = any;
type ChangePasswordRequest = {
  userId: string;
  currentPassword: string;
  newPassword: string;
};
type ChangePasswordResponse = any;
type UpdateTeamMemberRequest = {
  id: string;
  name?: string;
  phone?: string;
};
type UpdateTeamMemberResponse = any;

export const teamMembersApi = createApi({
  reducerPath: "teamMembersApi",
  tagTypes: ["Statuses"],
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      if (!headers.get("Accept")) {
        headers.set("Accept", "application/json");
      }
      if (!headers.get("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<TeamMemberLoginResponse, TeamMemberLoginRequest>({
      query: (credentials) => ({
        url: "/api/v1/team-members/login",
        method: "POST",
        body: credentials,
      }),
    }),
    logout: builder.mutation<TeamMemberLogoutResponse, TeamMemberLogoutRequest>(
      {
        query: (payload) => ({
          url: "/api/v1/team-members/logout",
          method: "POST",
          body: payload,
        }),
      }
    ),
    getCampaignForTeamMember: builder.query<
      CampaignResponse,
      string
    >({
      query: (id) => ({
        url: `/api/v1/campaign/team-member/${id}`,
        method: "GET",
      }),
    }),
    getStatusesByCampaign: builder.query<StatusesByLobResponse, string>({
      query: (campaignId) => ({
        url: `/api/v1/statuses/campaign/${campaignId}`,
        method: "GET",
      }),
      providesTags: ["Statuses"],
    }),
    changePassword: builder.mutation<
      ChangePasswordResponse,
      ChangePasswordRequest
    >({
      query: (payload) => ({
        url: `/api/v1/team-members/password`,
        method: "PATCH",
        body: payload,
      }),
    }),
    updateTeamMember: builder.mutation<
      UpdateTeamMemberResponse,
      UpdateTeamMemberRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/api/v1/team-members/${id}`,
        method: "PATCH",
        body,
      }),
    }),
    getTeamMembersByCampaignId: builder.query<
      any,
      { campaignId: string; page?: number; limit?: number; search?: string }
    >({
      query: ({ campaignId, page = 1, limit = 10, search = "" }) => ({
        url: `/api/v1/team-members/campaign/${campaignId}`,
        method: "GET",
        params: { page, limit, search },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetCampaignForTeamMemberQuery,
  useGetStatusesByCampaignQuery,
  useChangePasswordMutation,
  useUpdateTeamMemberMutation,
  useGetTeamMembersByCampaignIdQuery,
} = teamMembersApi;
