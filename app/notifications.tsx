import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AnimatedHeader from "@/components/AnimatedHeader";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type NotificationEntry = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  message: string;
  highlight?: string;
  suffix?: string;
  time: string;
};

type NotificationSection = {
  title: string;
  items: NotificationEntry[];
};

const NOTIFICATIONS: NotificationSection[] = [
  {
    title: "Today",
    items: [
      {
        id: "1",
        icon: "card-outline",
        iconBg: "rgba(237, 74, 133, 0.12)",
        message: "A Netflix payout of ",
        highlight: "$19",
        suffix: " has been successful!",
        time: "11:00 AM",
      },
      {
        id: "2",
        icon: "add-circle-outline",
        iconBg: "rgba(237, 74, 133, 0.12)",
        message: "Successfully top up balance ",
        highlight: "$150",
        suffix: " from US CITIBAN. See details here.",
        time: "08:00 AM",
      },
      {
        id: "3",
        icon: "card-outline",
        iconBg: "rgba(248, 231, 28, 0.22)",
        message: "Please top up to continue transactions on Netflix",
        time: "01:00 AM",
      },
    ],
  },
  {
    title: "Yesterday",
    items: [
      {
        id: "4",
        icon: "return-down-back-outline",
        iconBg: "rgba(237, 74, 133, 0.12)",
        message: "You received money from JENNIFER BACHDIM ",
        highlight: "$640",
        time: "11:00 AM",
      },
      {
        id: "5",
        icon: "return-up-forward-outline",
        iconBg: "rgba(237, 74, 133, 0.12)",
        message: "You have sent ",
        highlight: "$100",
        suffix: " to MARK ANTHONY",
        time: "08:00 AM",
      },
      {
        id: "6",
        icon: "return-up-forward-outline",
        iconBg: "rgba(237, 74, 133, 0.12)",
        message: "You have sent ",
        highlight: "$15",
        suffix: " to JORDAN BAQ",
        time: "08:00 AM",
      },
    ],
  },
];

export default function NotificationsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = React.useMemo(() => createStyles(palette, colorScheme), [palette, colorScheme]);
  
  // 👇 Animated scroll tracking
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <Animated.ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={palette.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
          <View style={styles.headerButton} />
        </View>

        {NOTIFICATIONS.map((section) => (
          <View key={section.title}>
            <Text style={styles.sectionHeading}>{section.title}</Text>
            <View style={styles.sectionList}>
              {section.items.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.card,
                    index < section.items.length - 1 && styles.cardDivider,
                  ]}
                >
                  <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
                    <Ionicons name={item.icon} size={20} color={palette.interactiveSecondary} />
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardMessage}>
                      {item.message}
                      {item.highlight ? (
                        <Text style={styles.cardHighlight}>{item.highlight}</Text>
                      ) : null}
                      {item.suffix ? item.suffix : ""}
                    </Text>
                    <Text style={styles.cardTime}>{item.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </Animated.ScrollView>
      <AnimatedHeader title="Notifications" scrollY={scrollY} />
    </SafeAreaView>
  );
}

const createStyles = (palette: (typeof Colors)["light"], colorScheme: "light" | "dark") =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 24,
      paddingBottom: 32,
      paddingTop: 16,
      gap: 24,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 0,
      backgroundColor: palette.bgSecondary,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: palette.mediumGray,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      textAlign: "center",
      color: palette.interactiveSecondary,
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    sectionHeading: {
      fontSize: 13,
      fontWeight: "700",
      color: palette.primaryLighter,
      marginBottom: 12,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    sectionList: {
      backgroundColor: palette.accentWhite,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOpacity: 0.04,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 16,
      elevation: 1,
    },
    card: {
      flexDirection: "row",
      gap: 16,
      paddingHorizontal: 18,
      paddingVertical: 20,
      alignItems: "center",
    },
    cardDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.offWhite2,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 0,
      justifyContent: "center",
      alignItems: "center",
    },
    cardBody: {
      flex: 1,
      gap: 6,
    },
    cardMessage: {
      fontSize: 15,
      fontWeight: "600",
      color: palette.textPrimary,
      lineHeight: 21,
    },
    cardHighlight: {
      color: palette.interactivePrimary,
    },
    cardTime: {
      fontSize: 12,
      color: palette.primaryLighter,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
  });

