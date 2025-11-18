import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { BottomTabBar, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, View } from "react-native";

const { width } = Dimensions.get("window");
const TAB_COUNT = 5; // Dashboard, Customer Book, Team Members, Report, Settings
const TAB_WIDTH = width / TAB_COUNT;

export default function AnimatedTabBar(props: BottomTabBarProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  const tabNames = ["index", "customer-book", "team-members", "report", "settings"];

  // Get the active route name from props.state
  const getActiveTabIndex = () => {
    if (!props.state) return 0;
    const state = props.state;
    const routes = state.routes;
    if (!routes || routes.length === 0) return 0;

    // For tab navigator, find the active tab route
    const activeRoute = routes[state.index];
    if (!activeRoute) return 0;

    const routeName = activeRoute.name;
    const index = tabNames.indexOf(routeName);
    return index >= 0 ? index : 0;
  };

  const activeIndex = getActiveTabIndex();

  useEffect(() => {
    Animated.timing(indicatorAnim, {
      toValue: activeIndex,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, indicatorAnim]);

  const translateX = indicatorAnim.interpolate({
    inputRange: [0, TAB_COUNT - 1],
    outputRange: [0, (TAB_COUNT - 1) * TAB_WIDTH],
  });

  return (
    <View style={{ position: "relative" }}>
      <BottomTabBar {...props} />
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 3,
          width: TAB_WIDTH,
          backgroundColor: colorScheme === "dark" ? palette.mutedSageGreen : palette.interactivePrimary,
          transform: [{ translateX }],
        }}
      />
    </View>
  );
}

