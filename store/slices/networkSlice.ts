import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type NetworkStatus = "online" | "offline" | "slow" | "checking";

interface NetworkState {
  status: NetworkStatus;
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  showBanner: boolean;
  wasOffline: boolean; // Track if we were offline to show "back online" message
}

const initialState: NetworkState = {
  status: "checking",
  isConnected: false,
  isInternetReachable: null,
  type: null,
  showBanner: false,
  wasOffline: false,
};

const networkSlice = createSlice({
  name: "network",
  initialState,
  reducers: {
    setNetworkStatus: (
      state,
      action: PayloadAction<{
        isConnected: boolean;
        isInternetReachable: boolean | null;
        type: string | null;
      }>
    ) => {
      const { isConnected, isInternetReachable, type } = action.payload;
      state.isConnected = isConnected;
      state.isInternetReachable = isInternetReachable;
      state.type = type;

      // Determine status
      if (!isConnected || isInternetReachable === false) {
        state.status = "offline";
        state.wasOffline = true;
        state.showBanner = true;
      } else if (isConnected && isInternetReachable) {
        // Check if we were offline before (to show "back online" message)
        if (state.wasOffline) {
          state.status = "online";
          state.showBanner = true;
          state.wasOffline = false;
        } else {
          state.status = "online";
          state.showBanner = false;
        }
      } else {
        state.status = "checking";
        state.showBanner = false;
      }
    },
    setSlowConnection: (state) => {
      state.status = "slow";
      state.showBanner = true;
    },
    clearSlowConnection: (state) => {
      if (state.status === "slow") {
        state.status = "online";
        state.showBanner = false;
      }
    },
    hideBanner: (state) => {
      state.showBanner = false;
    },
    setChecking: (state) => {
      state.status = "checking";
      state.showBanner = false;
    },
  },
});

export const {
  setNetworkStatus,
  setSlowConnection,
  clearSlowConnection,
  hideBanner,
  setChecking,
} = networkSlice.actions;
export default networkSlice.reducer;

