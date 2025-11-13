import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AnimatedHeader from "@/components/AnimatedHeader";
import PageTitle from "@/components/PageTitle";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = React.useMemo(() => createStyles(palette), [palette]);

  // 👇 Animated scroll tracking
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle="light-content" translucent />

      {/* Scrollable content */}
      <Animated.ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        <PageTitle title="Dashboard" />
        {/* Existing top header row */}
        <View style={styles.headerRow}>
          <View style={styles.headerMeta}>
            <Ionicons
              name="sunny-outline"
              size={18}
              color={palette.interactiveSecondary}
            />
            <Text style={[styles.headerText, { color: palette.textSecondary }]}>
              Good afternoon
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconBadge}
              onPress={() => router.push("/notifications")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="notifications-outline"
                size={18}
                color={palette.interactiveSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Your main dashboard content */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text
              style={[styles.balanceLabel, { color: palette.primaryLighter }]}
            >
              Total Balance
            </Text>
            <Ionicons
              name="eye-outline"
              size={18}
              color={palette.primaryLighter}
            />
          </View>
          <Text style={[styles.balanceValue, { color: palette.textPrimary }]}>
            $287.82
          </Text>
          <View style={styles.gainRow}>
            <Text style={[styles.gainLabel, { color: palette.primaryLighter }]}>
              Total Gains
            </Text>

            <View style={styles.gainChip}>
              <Ionicons
                name="arrow-up"
                size={14}
                color={palette.statusSuccess}
              />
              <Text style={styles.gainValue}>0.21%</Text>
            </View>
          </View>
          <View style={styles.carouselDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton}>
          <Ionicons name="add-outline" size={18} color={palette.textInverse} />
          <Text style={styles.primaryButtonText}>Add money</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your plans</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text
              style={[styles.link, { color: palette.interactiveSecondary }]}
            >
              View all plans
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.planGrid}>
          <TouchableOpacity
            style={[styles.planCard, { backgroundColor: palette.offWhite }]}
          >
            <View style={styles.planIcon}>
              <Ionicons
                name="add"
                size={24}
                color={palette.interactivePrimary}
              />
            </View>
            <Text style={[styles.planTitle, { color: palette.textSecondary }]}>
              Create an investment plan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.planCard,
              styles.planCardHighlight,
              { backgroundColor: palette.bgSecondary },
            ]}
            activeOpacity={0.85}
          >
            <Image
              source={require("@/assets/images/react-logo.png")}
              style={styles.planArt}
            />
            <View style={styles.planCopy}>
              <Text style={styles.planHighlightTitle}>Build Wealth</Text>
              <Text style={styles.planHighlightSubtitle}>Mixed assets</Text>
            </View>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={palette.textPrimary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.quoteCard}>
          <Text style={styles.quoteHeading}>TODAY’S QUOTE</Text>
          <View style={styles.quoteRule} />
          <Text style={styles.quoteBody}>
            We have no intention of rotating capital out of strong multi-year
            investments because they’ve recently done well or because ‘growth’
            has out performed ‘value’.
          </Text>
          <Text style={styles.quoteAuthor}>Carl Sagan</Text>
          <TouchableOpacity style={styles.quoteShare}>
            <Ionicons
              name="share-social-outline"
              size={18}
              color={palette.accentWhite}
            />
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>

      {/* 👇 Custom animated header (solid + instant appearance) */}
      <AnimatedHeader title="Dashboard" scrollY={scrollY} />
    </SafeAreaView>
  );
}

const createStyles = (palette: (typeof Colors)["light"]) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    container: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 48,
      gap: 24,
      paddingTop: "10%",
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    headerMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    headerText: {
      fontSize: 16,
      fontWeight: "500",
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    iconBadge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: palette.bgSecondary,
    },

    // --- Solid Animated Header (instant title appearance) ---
    animatedHeader: {
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
      borderColor: palette.slateGray,
    },
    animatedHeaderTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: palette.textPrimary,
    },

    // --- Rest of styles unchanged ---
    balanceCard: {
      padding: 24,
      backgroundColor: palette.accentWhite,
      shadowColor: palette.shadowColor,
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 16 },
      shadowRadius: 32,
      elevation: 6,
    },
    balanceHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    balanceLabel: {
      fontSize: 14,
      fontWeight: "500",
    },
    balanceValue: {
      fontSize: 40,
      fontWeight: "700",
      letterSpacing: -0.5,
      marginBottom: 16,
    },
    gainRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    gainLabel: {
      fontSize: 14,
    },
    gainChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: palette.interactiveHover,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    gainValue: {
      color: palette.statusSuccess,
      fontWeight: "600",
      fontSize: 14,
    },
    carouselDots: {
      flexDirection: "row",
      gap: 6,
      marginTop: 20,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 999,
      backgroundColor: palette.mediumGray,
    },
    dotActive: {
      width: 18,
      backgroundColor: palette.interactivePrimary,
    },
    primaryButton: {
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: palette.interactivePrimary,
      paddingVertical: 16,
      shadowColor: palette.interactivePrimary,
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 18,
      elevation: 4,
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: palette.textInverse,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: palette.textPrimary,
    },
    link: {
      fontSize: 14,
      fontWeight: "600",
    },
    planGrid: {
      flexDirection: "row",
      gap: 16,
    },
    planCard: {
      flex: 1,
      padding: 18,
      justifyContent: "space-between",
    },
    planIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: palette.offWhite2,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
    },
    planTitle: {
      fontSize: 14,
      fontWeight: "500",
      lineHeight: 20,
    },
    planCardHighlight: {
      position: "relative",
      overflow: "hidden",
    },
    planArt: {
      position: "absolute",
      bottom: -10,
      right: -20,
      width: 140,
      height: 140,
      opacity: 0.6,
    },
    planCopy: { gap: 6 },
    planHighlightTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: palette.textPrimary,
    },
    planHighlightSubtitle: {
      fontSize: 14,
      color: palette.textSecondary,
    },
    quoteCard: {
      padding: 24,
      position: "relative",
      backgroundColor: palette.interactiveSecondary,
    },
    quoteHeading: {
      color: palette.textInverse,
      fontSize: 12,
      letterSpacing: 1.2,
      fontWeight: "700",
    },
    quoteRule: {
      width: 36,
      height: 2,
      backgroundColor: palette.textInverse,
      marginVertical: 12,
      opacity: 0.5,
    },
    quoteBody: {
      color: palette.textInverse,
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 16,
    },
    quoteAuthor: {
      color: palette.textInverse,
      fontWeight: "600",
      fontSize: 14,
    },
    quoteShare: {
      position: "absolute",
      bottom: 20,
      right: 20,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.15)",
      alignItems: "center",
      justifyContent: "center",
    },
  });
