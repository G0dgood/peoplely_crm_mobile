import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import React from "react";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

const TAB_ICONS: Record<
  "index" | "customer-book" | "team-members" | "report" | "settings",
  keyof typeof Ionicons.glyphMap
> = {
  index: "speedometer-outline",
  "customer-book": "book-outline",
  "team-members": "people-outline",
  report: "bar-chart-outline",
  settings: "settings-outline",
};

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.interactivePrimary,
        tabBarInactiveTintColor: palette.primaryLighter,
        tabBarStyle: {
          backgroundColor: palette.background,
          borderTopColor: palette.mediumGray,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: "400",
        },
        tabBarIconStyle: {
          fontSize: 10,
          fontWeight: "300",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={TAB_ICONS.index} color={color} size={20} />
          ),
        }}
        listeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        }}
      />
      <Tabs.Screen
        name="customer-book"
        options={{
          title: "Customer Book",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name={TAB_ICONS["customer-book"]}
              color={color}
              size={20}
            />
          ),
        }}
        listeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        }}
      />
      <Tabs.Screen
        name="team-members"
        options={{
          title: "Team Members",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name={TAB_ICONS["team-members"]}
              color={color}
              size={size}
            />
          ),
        }}
        listeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: "Report",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={TAB_ICONS.report} color={color} size={20} />
          ),
        }}
        listeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Account",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={TAB_ICONS.settings} color={color} size={20} />
          ),
        }}
        listeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        }}
      />
    </Tabs>
  );
}
