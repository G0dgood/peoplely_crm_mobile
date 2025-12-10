import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// Import slices
import { teamMembersApi } from "./services/teamMembersApi";
import authReducer from "./slices/authSlice";
import dispositionReducer from "./slices/dispositionSlice";
import networkReducer from "./slices/networkSlice";
import notificationReducer from "./slices/notificationSlice";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    disposition: dispositionReducer,
    network: networkReducer,
    notification: notificationReducer,
    user: userReducer,
    [teamMembersApi.reducerPath]: teamMembersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(teamMembersApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for useDispatch and useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
