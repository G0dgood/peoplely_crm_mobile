import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as Haptics from "expo-haptics";

export interface Disposition {
  id: string;
  callAnswered: string;
  reasonForNonPayment: string;
  reasonForNotWatching: string;
  commitmentDate: string;
  amount: string;
  date: string;
  time: string;
  comment: string;
  agentName: string;
  agentId: string;
  dateContacted: string;
  synced: boolean;
  createdAt: number;
}

interface DispositionState {
  dispositions: Disposition[];
  pendingDispositions: Disposition[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DispositionState = {
  dispositions: [],
  pendingDispositions: [],
  isLoading: false,
  error: null,
};

const dispositionSlice = createSlice({
  name: "disposition",
  initialState,
  reducers: {
    setDispositions: (state, action: PayloadAction<Disposition[]>) => {
      // Separate synced and pending dispositions
      const synced = action.payload.filter((d) => d.synced);
      const pending = action.payload.filter((d) => !d.synced);
      state.dispositions = synced;
      state.pendingDispositions = pending;
    },
    addDisposition: (state, action: PayloadAction<Disposition>) => {
      if (action.payload.synced) {
        state.dispositions.push(action.payload);
      } else {
        state.pendingDispositions.push(action.payload);
      }
    },
    updateDisposition: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Disposition> }>
    ) => {
      const { id, updates } = action.payload;
      const index = state.dispositions.findIndex((d) => d.id === id);
      if (index !== -1) {
        state.dispositions[index] = { ...state.dispositions[index], ...updates };
      } else {
        const pendingIndex = state.pendingDispositions.findIndex(
          (d) => d.id === id
        );
        if (pendingIndex !== -1) {
          state.pendingDispositions[pendingIndex] = {
            ...state.pendingDispositions[pendingIndex],
            ...updates,
          };
        }
      }
    },
    markAsSynced: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const index = state.pendingDispositions.findIndex((d) => d.id === id);
      if (index !== -1) {
        const disposition = state.pendingDispositions[index];
        disposition.synced = true;
        state.dispositions.push(disposition);
        state.pendingDispositions.splice(index, 1);
      }
    },
    syncAllPending: (state) => {
      state.dispositions.push(...state.pendingDispositions);
      state.pendingDispositions.forEach((d) => {
        d.synced = true;
      });
      state.pendingDispositions = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    removeDisposition: (state, action: PayloadAction<string>) => {
      state.dispositions = state.dispositions.filter(
        (d) => d.id !== action.payload
      );
      state.pendingDispositions = state.pendingDispositions.filter(
        (d) => d.id !== action.payload
      );
    },
  },
});

export const {
  setDispositions,
  addDisposition,
  updateDisposition,
  markAsSynced,
  syncAllPending,
  setLoading,
  setError,
  removeDisposition,
} = dispositionSlice.actions;

// Thunks with haptic feedback (defined after actions are created)
export const addDispositionWithHaptic = createAsyncThunk(
  "disposition/addWithHaptic",
  async (disposition: Disposition, { dispatch }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch(addDisposition(disposition));
    return disposition;
  }
);

export const markAsSyncedWithHaptic = createAsyncThunk(
  "disposition/markAsSyncedWithHaptic",
  async (id: string, { dispatch }) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    dispatch(markAsSynced(id));
    return id;
  }
);

export const syncAllPendingWithHaptic = createAsyncThunk<
  number,
  void,
  { state: { disposition: DispositionState } }
>(
  "disposition/syncAllPendingWithHaptic",
  async (_, { dispatch, getState }) => {
    const state = getState();
    const pendingCount = state.disposition.pendingDispositions.length;
    
    if (pendingCount > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      dispatch(syncAllPending());
    }
    return pendingCount;
  }
);

export const removeDispositionWithHaptic = createAsyncThunk(
  "disposition/removeWithHaptic",
  async (id: string, { dispatch }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch(removeDisposition(id));
    return id;
  }
);

export const updateDispositionWithHaptic = createAsyncThunk(
  "disposition/updateWithHaptic",
  async (
    payload: { id: string; updates: Partial<Disposition> },
    { dispatch }
  ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch(updateDisposition(payload));
    return payload;
  }
);

export default dispositionSlice.reducer;

