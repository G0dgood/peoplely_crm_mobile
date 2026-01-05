import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React, { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AnimatedTabBar(props: BottomTabBarProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Filter out routes that are hidden (href: null)
  const visibleRoutes = props.state.routes.filter(
    (route) => {
      const options = props.descriptors[route.key]?.options as any;
      return options?.href !== null && options?.tabBarItemStyle?.display !== 'none';
    }
  );

  const tabCount = visibleRoutes.length > 0 ? visibleRoutes.length : 1;
  const tabWidth = width / tabCount;

  // Find the index of the active tab within the visible routes
  const activeRoute = props.state.routes[props.state.index];
  const activeIndex = visibleRoutes.findIndex(r => r.key === activeRoute?.key);

  useEffect(() => {
    // Only animate if the active tab is visible
    if (activeIndex !== -1) {
      Animated.timing(indicatorAnim, {
        toValue: activeIndex,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [activeIndex, indicatorAnim]);

  const translateX = indicatorAnim.interpolate({
    inputRange: [0, Math.max(1, tabCount - 1)],
    outputRange: [0, Math.max(1, tabCount - 1) * tabWidth],
  });

  // Hide tab bar when only "Account" (settings) is visible
  if (visibleRoutes.length === 1 && visibleRoutes[0]?.name === "settings") {
    return null;
  }

  return (
    <View style={{ position: "relative", backgroundColor: palette.background }}>
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

      {/* Tab Items */}
      <View style={{
        flexDirection: 'row',
        paddingBottom: insets.bottom,
        paddingTop: 10,
        height: 50 + insets.bottom // Standard tab bar height + safe area
      }}>
        {visibleRoutes.map((route, index) => {
          const { options } = props.descriptors[route.key];
          const isFocused = index === activeIndex;

          const onPress = () => {
            let defaultPrevented = false;
            try {
              const event = props.navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              defaultPrevented = event.defaultPrevented;
            } catch {
              // Ignore POP_TO_TOP errors that can occur in Expo Router 
              // when tapping an active tab that isn't a stack
            }

            if (!isFocused && !defaultPrevented) {
              props.navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            props.navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              {options.tabBarIcon && options.tabBarIcon({
                focused: isFocused,
                color: isFocused ? (colorScheme === "light" ? "#000000" : palette.tabIconSelected) : palette.tabIconDefault,
                size: 24
              })}
              {options.title && (
                <Text style={{
                  fontSize: 9,
                  fontWeight: "400",
                  color: isFocused ? (colorScheme === "light" ? "#000000" : palette.tabIconSelected) : palette.tabIconDefault,
                  marginTop: 4
                }}>
                  {options.title}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

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
