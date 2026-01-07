import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

const PENDING_DISPOSITIONS_KEY = "@pending_dispositions";
const SYNCED_DISPOSITIONS_KEY = "@synced_dispositions";

export interface DispositionData {
  id: string;
  customerId?: string;
  callAnswered?: string;
  reasonForNonPayment?: string;
  reasonForNotWatching?: string;
  commitmentDate?: string;
  amount?: string;
  date?: string;
  time?: string;
  comment?: string;
  agentName: string;
  agentId: string;
  dateContacted: string;
  synced: boolean;
  createdAt: number;
  fillDisposition?: any[];
  customerName?: string;
  lineOfBusinessId?: string;
  [key: string]: any;
}

// Helper to save directly to synced storage (used when API save is successful)
export const saveSyncedDisposition = async (
  fillDisposition: any[],
  customerId: string,
  customerName: string,
  agentName: string | undefined,
  agentId: string | undefined,
  lineOfBusinessId: string | undefined
) => {
  try {
    const disposition: DispositionData = {
      id: `disp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId,
      agentName: agentName || "Unknown",
      agentId: agentId || "Unknown",
      dateContacted: new Date().toLocaleString(),
      synced: true,
      createdAt: Date.now(),
      fillDisposition,
      customerName,
      lineOfBusinessId
    };
    const synced = await getSyncedDispositions();
    synced.push(disposition);
    await AsyncStorage.setItem(SYNCED_DISPOSITIONS_KEY, JSON.stringify(synced));
  } catch (error) {
    console.error("Error saving synced disposition:", error);
  }
};

// Save disposition data (offline or online)
export const saveDisposition = async (data: any): Promise<DispositionData> => {
  const networkState = await NetInfo.fetch();
  const isOnline = networkState.isConnected ?? false;

  const disposition: DispositionData = {
    ...data,
    id: `disp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    synced: isOnline,
    createdAt: Date.now(),
  };

  if (isOnline) {
    // Try to sync immediately
    try {
      await syncDisposition(disposition);
      // Save to synced storage
      const synced = await getSyncedDispositions();
      synced.push(disposition);
      await AsyncStorage.setItem(SYNCED_DISPOSITIONS_KEY, JSON.stringify(synced));
    } catch (error) {
      // If sync fails, save as pending
      console.error("Sync failed, saving as pending:", error);
      const pending = await getPendingDispositions();
      pending.push(disposition);
      await AsyncStorage.setItem(PENDING_DISPOSITIONS_KEY, JSON.stringify(pending));
    }
  } else {
    // Save as pending for later sync
    const pending = await getPendingDispositions();
    pending.push(disposition);
    await AsyncStorage.setItem(PENDING_DISPOSITIONS_KEY, JSON.stringify(pending));
  }

  return disposition;
};

// Get all dispositions (synced + pending)
export const getAllDispositions = async (): Promise<DispositionData[]> => {
  const [synced, pending] = await Promise.all([
    getSyncedDispositions(),
    getPendingDispositions(),
  ]);
  return [...synced, ...pending].sort((a, b) => b.createdAt - a.createdAt);
};

// Get pending dispositions
export const getPendingDispositions = async (): Promise<DispositionData[]> => {
  try {
    const data = await AsyncStorage.getItem(PENDING_DISPOSITIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting pending dispositions:", error);
    return [];
  }
};

// Get synced dispositions
export const getSyncedDispositions = async (): Promise<DispositionData[]> => {
  try {
    const data = await AsyncStorage.getItem(SYNCED_DISPOSITIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting synced dispositions:", error);
    return [];
  }
};

export const getOfflineDispositions = async (): Promise<DispositionData[]> => {
  return getPendingDispositions();
};
const syncDisposition = async (disposition: DispositionData): Promise<void> => {
  // Simulate API call - replace with actual API endpoint
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate 90% success rate
      if (Math.random() > 0.1) {
        resolve();
      } else {
        reject(new Error("Network error"));
      }
    }, 500);
  });
};

// Sync all pending dispositions
export const syncPendingDispositions = async (): Promise<{ synced: number; failed: number }> => {
  const networkState = await NetInfo.fetch();
  if (!networkState.isConnected) {
    return { synced: 0, failed: 0 };
  }

  const pending = await getPendingDispositions();
  if (pending.length === 0) {
    return { synced: 0, failed: 0 };
  }

  const synced: DispositionData[] = [];
  const failed: DispositionData[] = [];

  for (const disposition of pending) {
    try {
      await syncDisposition(disposition);
      const updated = { ...disposition, synced: true };
      synced.push(updated);
    } catch (error) {
      failed.push(disposition);
    }
  }

  // Update storage
  const existingSynced = await getSyncedDispositions();
  await AsyncStorage.setItem(
    SYNCED_DISPOSITIONS_KEY,
    JSON.stringify([...existingSynced, ...synced])
  );
  await AsyncStorage.setItem(PENDING_DISPOSITIONS_KEY, JSON.stringify(failed));

  return { synced: synced.length, failed: failed.length };
};

// Check network status
export const isOnline = async (): Promise<boolean> => {
  const networkState = await NetInfo.fetch();
  return networkState.isConnected ?? false;
};

