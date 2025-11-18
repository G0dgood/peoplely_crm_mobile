import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

const STATUS_OPTIONS = [
  {
    id: "available",
    label: "Available/Ready",
    icon: "checkmark-circle-outline",
    color: "statusSuccess",
  },
  {
    id: "busy",
    label: "Busy On Call",
    icon: "call-outline",
    color: "statusError",
  },
  {
    id: "acw",
    label: "After Call Work (ACW)",
    icon: "document-text-outline",
    color: "statusWarning",
  },
  { id: "away", label: "Away", icon: "time-outline", color: "statusInfo" },
  {
    id: "break",
    label: "On Break",
    icon: "cafe-outline",
    color: "interactivePrimary",
  },
  {
    id: "meeting",
    label: "In a Meeting",
    icon: "people-outline",
    color: "interactiveSecondary",
  },
];

interface DashboardHeaderProps {
  userName?: string;
  currentStatus: string;
  onStatusPress: () => void;
  notificationCount?: number;
}

export default function DashboardHeader({
  userName,
  currentStatus,
  onStatusPress,
  notificationCount = 0,
}: DashboardHeaderProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = React.useMemo(() => createStyles(palette), [palette]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const status = STATUS_OPTIONS.find((s) => s.id === currentStatus);

  return (
    <View style={styles.headerRow}>
      <View style={styles.headerMeta}>
        <Ionicons
          name="sunny-outline"
          size={18}
          color={palette.interactiveSecondary}
        />
        <View>
          <Text style={[styles.headerText, { color: palette.textSecondary }]}>
            {getGreeting()}
          </Text>
          {userName && (
            <Text style={[styles.userName, { color: palette.textPrimary }]}>
              {userName}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.statusBadge}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onStatusPress();
          }}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  palette[status?.color as keyof typeof palette] ||
                  palette.statusSuccess,
              },
            ]}
          />
          <Text
            style={[styles.statusBadgeText, { color: palette.textPrimary }]}
            numberOfLines={1}
          >
            {status?.label || "Available"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBadge}
          onPress={() => router.push("/notifications")}
          activeOpacity={0.8}
        >
          <Ionicons
            name="notifications-outline"
            size={18}
            color={palette.interactiveSecondary}
          />
          {notificationCount > 0 && (
            <View
              style={[
                styles.notificationBadge,
                { backgroundColor: palette.statusError },
              ]}
            >
              <Text style={styles.notificationBadgeText}>
                {notificationCount > 99 ? "99+" : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (palette: (typeof Colors)["light"]) =>
  StyleSheet.create({
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    headerMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    headerText: {
      fontSize: 16,
      fontWeight: "500",
    },
    userName: {
      fontSize: 18,
      fontWeight: "600",
      marginTop: 2,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 0,
      backgroundColor: palette.bgSecondary,
      gap: 8,
      marginRight: 8,
      minWidth: 100,
      height: 36,
    },
    statusDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: palette.accentWhite,
    },
    statusBadgeText: {
      fontSize: 12,
      fontWeight: "500",
      maxWidth: 120,
    },
    iconBadge: {
      width: 36,
      height: 36,
      borderRadius: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: palette.bgSecondary,
      position: "relative",
    },
    notificationBadge: {
      position: "absolute",
      top: 1,
      right: 2,
      minWidth: 16,
      height: 16,
      borderRadius: 9,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 3,
      borderWidth: 2,
      borderColor: palette.accentWhite,
    },
    notificationBadgeText: {
      color: palette.textInverse,
      fontSize: 8,
      fontWeight: "700",
    },
  });

