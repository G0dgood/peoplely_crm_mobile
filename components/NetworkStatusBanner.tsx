import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { hideBanner } from "@/store/slices/networkSlice";

export default function NetworkStatusBanner() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = useMemo(() => createStyles(palette), [palette]);

  const dispatch = useAppDispatch();
  const { status, showBanner } = useAppSelector((state) => state.network);

  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const previousStatusRef = useRef<string | null>(null);

  useEffect(() => {
    if (showBanner) {
      // Trigger haptic feedback based on status
      if (previousStatusRef.current !== status) {
        switch (status) {
          case "offline":
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            break;
          case "online":
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;
          case "slow":
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            break;
        }
        previousStatusRef.current = status;
      }

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

      // Auto-hide for "online" status after 3 seconds
      if (status === "online") {
        const timer = setTimeout(() => {
          handleHide();
        }, 3000);
        return () => clearTimeout(timer);
      }
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
  }, [showBanner, status]);

  const handleHide = () => {
    dispatch(hideBanner());
  };

  if (!showBanner) {
    return null;
  }

  const getStatusConfig = () => {
    switch (status) {
      case "offline":
        return {
          icon: "cloud-offline-outline",
          message: "No internet connection",
          backgroundColor: palette.statusError,
          textColor: palette.textInverse,
        };
      case "online":
        return {
          icon: "checkmark-circle-outline",
          message: "Back online",
          backgroundColor: palette.statusSuccess,
          textColor: palette.textInverse,
        };
      case "slow":
        return {
          icon: "hourglass-outline",
          message: "Slow connection detected",
          backgroundColor: palette.statusWarning,
          textColor: palette.textInverse,
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.leftSection}>
            <Ionicons
              name={config.icon as any}
              size={20}
              color={config.textColor}
            />
            <Text style={[styles.message, { color: config.textColor }]}>
              {config.message}
            </Text>
          </View>
          {status !== "online" && (
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleHide();
              }}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={18} color={config.textColor} />
            </TouchableOpacity>
          )}
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

