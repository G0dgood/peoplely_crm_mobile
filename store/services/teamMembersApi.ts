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
type LineOfBusinessResponse = any;
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
    getLineOfBusinessForTeamMember: builder.query<
      LineOfBusinessResponse,
      string
    >({
      query: (id) => ({
        url: `/api/v1/line-of-business/team-member/${id}`,
        method: "GET",
      }),
    }),
    getStatusesByLineOfBusiness: builder.query<StatusesByLobResponse, string>({
      query: (lobId) => ({
        url: `/api/v1/statuses/line-of-business/${lobId}`,
        method: "GET",
      }),
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
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetLineOfBusinessForTeamMemberQuery,
  useGetStatusesByLineOfBusinessQuery,
  useChangePasswordMutation,
  useUpdateTeamMemberMutation,
} = teamMembersApi;
