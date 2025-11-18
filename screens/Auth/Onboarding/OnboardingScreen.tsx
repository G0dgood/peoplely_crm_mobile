import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { ImageSourcePropType } from "react-native";

const { width, height } = Dimensions.get("window");

type Slide = {
  id: string;
  image: ImageSourcePropType;
  title: string;
  subtitle: string;
};

const slides: Slide[] = [
  {
    id: "call-management",
    image: require("../../../assets/images/call1.png") as ImageSourcePropType,
    title: "Efficient Call Management",
    subtitle: "Handle customer calls seamlessly with advanced call routing and tracking capabilities.",
  },
  {
    id: "customer-interactions",
    image: require("../../../assets/images/call2.png") as ImageSourcePropType,
    title: "Track Customer Interactions",
    subtitle: "Record and manage call dispositions, follow-ups, and customer history in one place.",
  },
  {
    id: "team-performance",
    image: require("../../../assets/images/call3.png") as ImageSourcePropType,
    title: "Monitor Team Performance",
    subtitle: "Get real-time insights into call volumes, agent performance, and customer satisfaction metrics.",
  },
];

export default function OnboardingScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = useMemo(() => createStyles(palette), [palette]);

  const scrollRef = useRef<ScrollView | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSelectedIndex((prev) => {
        const nextIndex = prev === slides.length - 1 ? 0 : prev + 1;
        scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
        return nextIndex;
      });
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const viewSize = event.nativeEvent.layoutMeasurement;
    const index = Math.round(contentOffset.x / viewSize.width);
    setSelectedIndex(index);
  };

  const handleGetStarted = () => {
    router.replace("/auth/login");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        onMomentumScrollEnd={handleScrollEnd}
        ref={scrollRef}
        showsHorizontalScrollIndicator={false}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <Image source={slide.image} style={styles.onboardingImage} />
            <View style={styles.textContainer}>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.subtitle}>{slide.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.progressContainer}>
        {slides.map((slide, index) => {
          const isActive = index === selectedIndex;
          return (
            <View
              key={slide.id}
              style={[
                styles.progressDot,
                {
                  backgroundColor: isActive
                    ? palette.interactivePrimary
                    : palette.textSecondary,
                  width: isActive ? 30 : 6,
                },
              ]}
            />
          );
        })}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (palette: (typeof Colors)["light"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    slide: {
      alignItems: "center",
      justifyContent: "flex-start",
      width,
      paddingHorizontal: width * 0.08,
    },
    onboardingImage: {
      width: width,
      height: height * 0.6,
      resizeMode: "cover",
      marginBottom: height * 0.04,
    },
    textContainer: {
      paddingHorizontal: width * 0.04,
      alignItems: "center",
      gap: height * 0.02,
    },
    title: {
      color: palette.textPrimary,
      fontSize: 22,
      fontWeight: "600",
      textAlign: "center",
    },
    subtitle: {
      color: palette.textSecondary,
      fontSize: 16,
      lineHeight: 22,
      textAlign: "center",
    },
    progressContainer: {
      position: "absolute",
      bottom: height * 0.16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      gap: 8,
    },
    progressDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    button: {
      width: width * 0.9,
      backgroundColor: palette.interactivePrimary,
      paddingVertical: height * 0.018,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: height * 0.06,
      alignSelf: "center",
      shadowColor: palette.shadowColor,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 4,
      zIndex: 1000,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "600",
      color: palette.textInverse,
    },
  });
