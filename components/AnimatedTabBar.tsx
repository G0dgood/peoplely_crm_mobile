import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { BottomTabBar, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, View } from "react-native";

const { width } = Dimensions.get("window");

export default function AnimatedTabBar(props: BottomTabBarProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  const { routes } = props.state;
  const tabCount = routes.length > 0 ? routes.length : 1;
  const tabWidth = width / tabCount;
  const activeIndex = props.state.index;

  useEffect(() => {
    Animated.timing(indicatorAnim, {
      toValue: activeIndex,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, indicatorAnim]);

  const translateX = indicatorAnim.interpolate({
    inputRange: [0, Math.max(1, tabCount - 1)],
    outputRange: [0, Math.max(1, tabCount - 1) * tabWidth],
  });

  return (
    <View style={{ position: "relative" }}>
      <BottomTabBar {...props} />
      {/* Top border for all tabs (inactive tabs) */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: palette.mediumGray,
        }}
      />
      {/* Active tab indicator (overlays the border) */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 3,
          width: tabWidth,
          backgroundColor: colorScheme === "dark" ? palette.mutedSageGreen : palette.interactivePrimary,
          transform: [{ translateX }],
        }}
      />
    </View>
  );
}

