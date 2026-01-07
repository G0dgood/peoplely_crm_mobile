import { useEffect, useRef } from "react";
import { Animated, DimensionValue, ViewStyle } from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  style?: ViewStyle;
  borderRadius?: number;
}

export default function Skeleton({
  width,
  height,
  style,
  borderRadius = 4,
}: SkeletonProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: palette.mediumGray,
          opacity,
          borderRadius,
        },
        style,
      ]}
    />
  );
}
