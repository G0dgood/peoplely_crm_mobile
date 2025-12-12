import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useGetStatusesByLineOfBusinessQuery } from "@/store/services/teamMembersApi";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface StatusBannerProps {
  currentStatus: string;
}

export default function StatusBanner({ currentStatus }: StatusBannerProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { data: statusesData } = useGetStatusesByLineOfBusinessQuery(
    "693806b15eb41d3dbd71d442"
  );
  const apiStatuses =
    (statusesData?.statuses || []).map((s: any) => ({
      id: String(s?.statusId || s?._id || s?.name || ""),
      label: String(s?.name || ""),
      colorHex: s?.color as string | undefined,
    })) || [];

  const [isVisible, setIsVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const previousStatusRef = useRef<string | null>(null);
  const isInitialMountRef = useRef(true);
  const initializationTimeoutRef = useRef<number | null>(null);

  const status = apiStatuses.find(
    (s: { id: string }) => s.id === currentStatus
  );
  const statusColor = status?.colorHex || palette.statusSuccess;
  const statusIcon: keyof typeof Ionicons.glyphMap =
    "information-circle-outline";

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsVisible(false);
  };

  // Set initial status after a brief delay to allow storage to load
  useEffect(() => {
    if (isInitialMountRef.current) {
      // Wait a bit for storage to load, then set the initial status
      initializationTimeoutRef.current = setTimeout(() => {
        previousStatusRef.current = currentStatus;
        isInitialMountRef.current = false;
      }, 500);
      return () => {
        if (initializationTimeoutRef.current) {
          clearTimeout(initializationTimeoutRef.current);
        }
      };
    }
  }, [currentStatus]);

  useEffect(() => {
    // Don't show banner during initialization phase
    if (isInitialMountRef.current || previousStatusRef.current === null) {
      return;
    }

    // Only show banner if status actually changed (user manually selected a new status)
    if (previousStatusRef.current !== currentStatus) {
      setIsVisible(true);
      previousStatusRef.current = currentStatus;
    }

    if (isVisible) {
      // Slide in and fade in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 4 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      // Slide out and fade out
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: -100,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, currentStatus, slideAnim, opacityAnim]);

  if (!status || !isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: statusColor,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.leftSection}>
            <Ionicons name={statusIcon} size={20} color={palette.textInverse} />
            <Text style={[styles.message, { color: palette.textInverse }]}>
              {status?.label || ""}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleDismiss}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={18} color={palette.textInverse} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const createStyles = (palette: (typeof Colors)["light"]) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      elevation: 10,
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
    },
    safeArea: {
      width: "100%",
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      minHeight: 48,
    },
    leftSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    message: {
      fontSize: 14,
      fontWeight: "600",
      flex: 1,
    },
    closeButton: {
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 0,
    },
  });
