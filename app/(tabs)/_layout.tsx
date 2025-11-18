import AnimatedTabBar from "@/components/AnimatedTabBar";
import AnimatedTabIcon from "@/components/AnimatedTabIcon";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import React from "react";

const TAB_ICONS: Record<
  "index" | "customer-book" | "team-members" | "report" | "settings",
  keyof typeof Ionicons.glyphMap
> = {
  index: "grid-outline",
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
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:
          colorScheme === "light" ? "#000000" : palette.tabIconSelected,
        tabBarInactiveTintColor: palette.tabIconDefault,
        tabBarStyle: {
          backgroundColor: palette.background,
          borderTopWidth: 0,
          borderTopColor: "transparent",
          elevation: 0,
          shadowOpacity: 0,
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
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name={TAB_ICONS["index"]}
              color={color}
              focused={false}
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
        name="customer-book"
        options={{
          title: "Customer Book",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name={TAB_ICONS["customer-book"]}
              color={color}
              focused={false}
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
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name={TAB_ICONS["team-members"]}
              color={color}
              focused={false}
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
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name={TAB_ICONS["report"]}
              color={color}
              focused={false}
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
        name="settings"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name={TAB_ICONS["settings"]}
              color={color}
              focused={false}
            />
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
