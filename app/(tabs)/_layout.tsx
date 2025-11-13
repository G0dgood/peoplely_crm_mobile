import { Ionicons } from "@expo/vector-icons";
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
				tabBarInactiveTintColor: palette.textSecondary,
				tabBarStyle: {
					backgroundColor: palette.background,
					borderTopColor: palette.mediumGray,
				},
				tabBarLabelStyle: {
					fontSize: 10,
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
						<Ionicons name={TAB_ICONS.index} color={color} size={size} />
					),
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
							size={size}
						/>
					),
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
			/>
			<Tabs.Screen
				name="report"
				options={{
					title: "Report",
					headerShown: false,
					tabBarIcon: ({ color, size }) => (
						<Ionicons name={TAB_ICONS.report} color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: "Settings",
					headerShown: false,
					tabBarIcon: ({ color, size }) => (
						<Ionicons name={TAB_ICONS.settings} color={color} size={size} />
					),
				}}
			/>
		</Tabs>
	);
}
