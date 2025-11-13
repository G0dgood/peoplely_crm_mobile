// components/AnimatedHeader.tsx
import React from "react";
import { Animated, StyleSheet, ViewStyle } from "react-native";

interface AnimatedHeaderProps {
  title: string;
  scrollY: Animated.Value;
  backgroundColor?: string;
  textColor?: string;
  inputRange?: [number, number];
  style?: ViewStyle;
}

export default function AnimatedHeader({
  title,
  scrollY,
  backgroundColor = "#fff",
  textColor = "#000",
  inputRange = [40, 120],
  style,
}: AnimatedHeaderProps) {
  // Interpolations for header animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [40, 120],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const titleOpacity = scrollY.interpolate({
    inputRange,
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={[
        styles.header,
        { backgroundColor, opacity: headerOpacity }, // header is always visible
        style,
      ]}
    >
      <Animated.Text
        style={[styles.title, { color: textColor, opacity: titleOpacity }]}
      >
        {title}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    paddingTop: 50,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
    borderBottomWidth: 0.5,
    borderColor: "#ddd",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
});
