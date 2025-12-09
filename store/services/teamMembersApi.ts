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
  }),
});

export const { useLoginMutation, useLogoutMutation } = teamMembersApi;
