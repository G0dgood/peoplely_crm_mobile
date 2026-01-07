import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { notificationApi } from "../services/notificationApi";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: number;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.read = true;
      });
      state.unreadCount = 0;
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification && !notification.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.read).length;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      notificationApi.endpoints.getNotificationsByLineOfBusinessId.matchFulfilled,
      (state, { payload }) => {
        const list = payload?.notifications || [];
        state.unreadCount = list.filter((n: any) => !n.isRead).length;
      }
    );
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  setNotifications,
  clearNotifications,
} = notificationSlice.actions;
export default notificationSlice.reducer;
