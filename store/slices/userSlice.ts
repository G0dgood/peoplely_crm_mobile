import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserStatus =
  | "Available/Ready"
  | "Busy On Call"
  | "After Call Work (ACW)"
  | "Away"
  | "On Break"
  | "In a Meeting";

interface UserState {
  status: UserStatus;
  preferences: {
    darkMode: boolean;
    notifications: boolean;
    soundEnabled: boolean;
  };
}

const initialState: UserState = {
  status: "Available/Ready",
  preferences: {
    darkMode: false,
    notifications: true,
    soundEnabled: true,
  },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<UserStatus>) => {
      state.status = action.payload;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.preferences.darkMode = action.payload;
    },
    setNotifications: (state, action: PayloadAction<boolean>) => {
      state.preferences.notifications = action.payload;
    },
    setSoundEnabled: (state, action: PayloadAction<boolean>) => {
      state.preferences.soundEnabled = action.payload;
    },
    updatePreferences: (
      state,
      action: PayloadAction<Partial<UserState["preferences"]>>
    ) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
  },
});

export const {
  setStatus,
  setDarkMode,
  setNotifications,
  setSoundEnabled,
  updatePreferences,
} = userSlice.actions;
export default userSlice.reducer;

