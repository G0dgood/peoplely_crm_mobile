import AnimatedTabBar from "@/components/AnimatedTabBar";
import AnimatedTabIcon from "@/components/AnimatedTabIcon";
import { Colors } from "@/constants/theme";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
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
  const { canAccess } = usePrivilege();

  const moduleMapping: Record<string, "dashboard" | "customerBook" | "teamMembers" | "report" | "systemSetting"> = {
    index: "dashboard",
    "customer-book": "customerBook",
    "team-members": "teamMembers",
    report: "report",
    settings: "systemSetting",
  };

  const navItems: { id: keyof typeof TAB_ICONS; label: string }[] = [
    { id: "index", label: "Dashboard" },
    { id: "customer-book", label: "Customer Book" },
    { id: "team-members", label: "Team Members" },
    { id: "report", label: "Report" },
    { id: "settings", label: "Account" },
  ];

  const visibleNavItems: { id: keyof typeof TAB_ICONS; label: string }[] = [];

  navItems.forEach((item) => {
    let isRestricted = false;
    const moduleId = moduleMapping[item.id];
    if (moduleId && !canAccess(moduleId, "view")) isRestricted = true;
    if (!isRestricted) {
      visibleNavItems.push(item);
    }
  });

  return (
    <Tabs
      tabBar={(props: React.JSX.IntrinsicAttributes & BottomTabBarProps) => <AnimatedTabBar {...props} />}
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
      {navItems.map((item) => {
        const isVisible = item.id === "settings" || visibleNavItems.some((v) => v.id === item.id);
        return (
          <Tabs.Screen
            key={item.id}
            name={item.id}
            options={{
              href: isVisible ? undefined : null,
              title: item.label,
              tabBarIcon: ({ color }: { color: string }) => (
                <AnimatedTabIcon name={TAB_ICONS[item.id]} color={color} />
              ),
            }}
            listeners={{
              tabPress: () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              },
            }}
          />
        );
      })}
    </Tabs>
  );
}
