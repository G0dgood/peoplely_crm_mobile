import { useCallback, useEffect } from "react";

import { useAppDispatch } from "@/store/hooks";
import { setDispositions } from "@/store/slices/dispositionSlice";
import {
  getPendingDispositions,
  getSyncedDispositions,
} from "@/utils/dispositionStorage";

/**
 * Hook to sync dispositions from AsyncStorage to Redux store
 */
export function useDispositionSync() {
  const dispatch = useAppDispatch();

  const loadDispositionsIntoRedux = useCallback(async () => {
    try {
      const [synced, pending] = await Promise.all([
        getSyncedDispositions(),
        getPendingDispositions(),
      ]);

      // Update Redux store with all dispositions
      dispatch(
        setDispositions([...synced, ...pending].sort((a, b) => b.createdAt - a.createdAt))
      );
    } catch (error) {
      console.error("Error loading dispositions into Redux:", error);
    }
  }, [dispatch]);

  useEffect(() => {
    // Load on mount
    loadDispositionsIntoRedux();

    // Set up interval to periodically sync (every 5 seconds)
    const interval = setInterval(() => {
      loadDispositionsIntoRedux();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [loadDispositionsIntoRedux]);

  return { loadDispositionsIntoRedux };
}

