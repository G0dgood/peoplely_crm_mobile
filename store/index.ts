import { configureStore, Reducer } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// Import slices
import { dispositionApi } from "./services/dispositionApi";
import { lineOfBusinessApi } from "./services/lineOfBusinessApi";
import { notificationApi } from "./services/notificationApi";
import { setupBookApi } from "./services/setupBookApi";
import { teamMembersApi } from "./services/teamMembersApi";
import authReducer from "./slices/authSlice";
import dispositionReducer from "./slices/dispositionSlice";
import networkReducer from "./slices/networkSlice";
import notificationReducer, { NotificationState } from "./slices/notificationSlice";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    disposition: dispositionReducer,
    network: networkReducer,
    notification: notificationReducer as Reducer<NotificationState>,
    user: userReducer,
    [teamMembersApi.reducerPath]: teamMembersApi.reducer,
    [lineOfBusinessApi.reducerPath]: lineOfBusinessApi.reducer,
    [setupBookApi.reducerPath]: setupBookApi.reducer,
    [dispositionApi.reducerPath]: dispositionApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware(
      process.env.NODE_ENV === "production"
        ? {}
        : {
            serializableCheck: false,
            immutableCheck: false,
          }
    )
      .concat(teamMembersApi.middleware)
      .concat(lineOfBusinessApi.middleware)
      .concat(setupBookApi.middleware)
      .concat(dispositionApi.middleware)
      .concat(notificationApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for useDispatch and useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
