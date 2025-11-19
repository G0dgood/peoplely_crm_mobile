import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import { Animated, PanResponder, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type TripleSliderProps = {
  value: "light" | "dark" | "auto";
  onValueChange: (value: "light" | "dark" | "auto") => void;
  labels?: [string, string, string];
};

const POSITIONS = {
  light: 0,
  auto: 1,
  dark: 2,
};

const VALUES: Array<"light" | "dark" | "auto"> = ["light", "auto", "dark"];

export default function TripleSlider({
  value,
  onValueChange,
  labels = ["Light", "Auto", "Dark"],
}: TripleSliderProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = React.useMemo(() => createStyles(palette), [palette]);

  const sliderWidth = 280;
  const trackWidth = sliderWidth;
  const thumbSize = 32;
  const maxThumbPosition = trackWidth - thumbSize;
  const segmentWidth = maxThumbPosition / 2;

  const currentIndex = POSITIONS[value];
  const getPosition = (index: number) => index * segmentWidth;
  const translateX = useRef(new Animated.Value(getPosition(currentIndex))).current;
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(getPosition(currentIndex));

  const snapToPosition = (index: number) => {
    Animated.spring(translateX, {
      toValue: getPosition(index),
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    if (index !== currentIndex) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onValueChange(VALUES[index]);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setIsDragging(true);
        startX.current = getPosition(currentIndex);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (_, gestureState) => {
        const newX = Math.max(
          0,
          Math.min(maxThumbPosition, startX.current + gestureState.dx)
        );
        translateX.setValue(newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsDragging(false);
        const currentX = startX.current + gestureState.dx;
        const threshold = segmentWidth / 2;
        let newIndex = currentIndex;

        // Determine which position to snap to based on current position
        if (currentX < threshold) {
          newIndex = 0;
        } else if (currentX < segmentWidth + threshold) {
          newIndex = 1;
        } else {
          newIndex = 2;
        }

        snapToPosition(newIndex);
      },
    })
  ).current;

  React.useEffect(() => {
    if (!isDragging) {
      Animated.spring(translateX, {
        toValue: getPosition(currentIndex),
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [currentIndex, isDragging]);

  const handleTrackPress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    snapToPosition(index);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelsContainer}>
        {labels.map((label, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleTrackPress(index)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.label,
                currentIndex === index && styles.labelActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={[styles.trackContainer, { width: trackWidth }]}>
        <View style={[styles.track, { width: trackWidth }]}>
          <Animated.View
            style={[
              styles.thumb,
              {
                width: thumbSize,
                height: thumbSize,
                transform: [{ translateX }],
              },
            ]}
            {...panResponder.panHandlers}
          />
        </View>
        {/* Invisible touch areas for each segment */}
        {[0, 1, 2].map((index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.trackSegment,
              {
                left: index * segmentWidth,
                width: segmentWidth,
              },
            ]}
            onPress={() => handleTrackPress(index)}
            activeOpacity={1}
          />
        ))}
      </View>
    </View>
  );
}

const createStyles = (palette: (typeof Colors)["light"]) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      gap: 16,
    },
    labelsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: 280,
    },
    label: {
      fontSize: 13,
      fontWeight: "500",
      color: palette.textSecondary,
      paddingVertical: 4,
    },
    labelActive: {
      color: palette.textPrimary,
      fontWeight: "600",
    },
    trackContainer: {
      position: "relative",
      height: 40,
      justifyContent: "center",
    },
    track: {
      height: 8,
      backgroundColor: palette.mediumGray,
      borderRadius: 4,
      position: "relative",
    },
    trackSegment: {
      position: "absolute",
      height: 40,
      top: 0,
    },
    thumb: {
      position: "absolute",
      top: -12,
      backgroundColor: palette.interactivePrimary,
      borderRadius: 16,
      shadowColor: palette.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
  });

