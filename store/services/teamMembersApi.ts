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

export const teamMembersApi = createApi({
  reducerPath: "teamMembersApi",
  baseQuery: fetchBaseQuery({ baseUrl }),
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
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetLineOfBusinessForTeamMemberQuery,
} = teamMembersApi;
