import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { useEffect, useRef } from "react";

import { useAppDispatch } from "@/store/hooks";
import {
  setNetworkStatus,
  setSlowConnection,
  clearSlowConnection,
} from "@/store/slices/networkSlice";

/**
 * Hook to monitor network status and detect slow connections
 */
export function useNetworkMonitor() {
  const dispatch = useAppDispatch();
  const slowConnectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastResponseTimeRef = useRef<number>(0);

  useEffect(() => {
    // Initial check
    NetInfo.fetch().then((state) => {
      handleNetworkChange(state);
    });

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      handleNetworkChange(state);
    });

    // Monitor connection speed by making periodic requests
    const speedCheckInterval = setInterval(() => {
      checkConnectionSpeed();
    }, 10000); // Check every 10 seconds

    return () => {
      unsubscribe();
      clearInterval(speedCheckInterval);
      if (slowConnectionTimeoutRef.current) {
        clearTimeout(slowConnectionTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const handleNetworkChange = (state: NetInfoState) => {
    dispatch(
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? null,
        type: state.type,
      })
    );
  };

  const checkConnectionSpeed = async () => {
    // Only check speed if we're online
    const currentState = await NetInfo.fetch();
    if (!currentState.isConnected || currentState.isInternetReachable === false) {
      return; // Don't check speed if offline
    }

    const startTime = Date.now();
    try {
      // Make a small request to check connection speed
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch("https://www.google.com/favicon.ico", {
        method: "HEAD",
        signal: controller.signal,
        cache: "no-cache",
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const responseTime = Date.now() - startTime;
        const previousResponseTime = lastResponseTimeRef.current;
        lastResponseTimeRef.current = responseTime;

        // Consider connection slow if response time > 3 seconds
        if (responseTime > 3000) {
          dispatch(setSlowConnection());
        } else if (previousResponseTime > 3000 && responseTime <= 2000) {
          // Connection improved - clear slow connection status
          dispatch(clearSlowConnection());
        }
      }
    } catch (error) {
      // Network error or timeout - connection might be slow or offline
      const responseTime = Date.now() - startTime;
      if (responseTime > 5000) {
        // Request timed out - connection is very slow
        dispatch(setSlowConnection());
      }
    }
  };
}

