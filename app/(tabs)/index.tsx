import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
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
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useDispositionSync } from "@/hooks/useDispositionSync";
import { useAppSelector } from "@/store/hooks";
// @ts-ignore
import { AVAILABLE_WIDGETS } from "@/app/modal/add-widget";
// @ts-ignore
import { BarChart, LineChart } from "expo-charts";
// @ts-ignore
import PieChart from "expo-charts/dist/PieChart";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const WIDGET_STORAGE_KEY = "@dashboard_selected_widgets";
const STATUS_STORAGE_KEY = "@user_status";

const STATUS_OPTIONS = [
  {
    id: "available",
    label: "Available/Ready",
    icon: "checkmark-circle-outline",
    color: "statusSuccess",
  }, // Green
  {
    id: "busy",
    label: "Busy On Call",
    icon: "call-outline",
    color: "statusError",
  }, // Red
  {
    id: "acw",
    label: "After Call Work (ACW)",
    icon: "document-text-outline",
    color: "statusWarning",
  }, // Orange
  { id: "away", label: "Away", icon: "time-outline", color: "statusInfo" }, // Gray/Blue
  {
    id: "break",
    label: "On Break",
    icon: "cafe-outline",
    color: "interactivePrimary",
  }, // Dark Blue/Orange
  {
    id: "meeting",
    label: "In a Meeting",
    icon: "people-outline",
    color: "interactiveSecondary",
  }, // Sage Green
];

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = React.useMemo(() => createStyles(palette), [palette]);
  const { user } = useAuth();

  //  Animated scroll tracking
  const scrollY = useRef(new Animated.Value(0)).current;

  // Card swipe tracking
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const cardScrollRef = useRef<ScrollView>(null);

  // Widget management
  const [selectedWidgetIds, setSelectedWidgetIds] = useState<string[]>([]);

  // Status management
  const [currentStatus, setCurrentStatus] = useState<string>("available");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Notification count
  const [notificationCount, setNotificationCount] = useState<number>(5);

  // Sync dispositions from AsyncStorage to Redux
  const { loadDispositionsIntoRedux } = useDispositionSync();

  // Get pending dispositions from Redux store
  const pendingDispositions = useAppSelector(
    (state) => state.disposition.pendingDispositions
  );
  const pendingCount = pendingDispositions.length;

  // Reload dispositions when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadDispositionsIntoRedux();
    }, [loadDispositionsIntoRedux])
  );

  // Load saved status on mount
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const saved = await AsyncStorage.getItem(STATUS_STORAGE_KEY);
        if (saved) {
          setCurrentStatus(saved);
        } else {
          setCurrentStatus("available");
        }
      } catch (error) {
        console.error("Error loading status:", error);
      }
    };
    loadStatus();
  }, []);

  // Load saved widgets on mount
  useEffect(() => {
    const loadWidgets = async () => {
      try {
        const saved = await AsyncStorage.getItem(WIDGET_STORAGE_KEY);
        if (saved) {
          setSelectedWidgetIds(JSON.parse(saved));
        } else {
          // Default to showing the first bar chart
          setSelectedWidgetIds(["bar-chart"]);
        }
      } catch (error) {
        console.error("Error loading widgets:", error);
      }
    };
    loadWidgets();
  }, []);

  // Reload widgets when screen comes into focus (returning from modal)
  useFocusEffect(
    useCallback(() => {
      const reloadWidgets = async () => {
        try {
          const saved = await AsyncStorage.getItem(WIDGET_STORAGE_KEY);
          if (saved) {
            setSelectedWidgetIds(JSON.parse(saved));
          }
        } catch (error) {
          console.error("Error reloading widgets:", error);
        }
      };
      reloadWidgets();
    }, [])
  );

  const selectedWidgets = AVAILABLE_WIDGETS.filter((widget) =>
    selectedWidgetIds.includes(widget.id)
  );

  // Build cards array - conditionally include "Pending Sync" only when there are pending items
  const baseCards = [
    {
      type: "total",
      label: "Total Calls",
      value: "28",
      icon: "call-outline",
      color: palette.interactivePrimary,
    },
    {
      type: "failed",
      label: "Failed Call",
      value: "12",
      icon: "close-circle",
      color: palette.statusError,
    },
    {
      type: "successful",
      label: "Successful",
      value: "45",
      icon: "checkmark-circle",
      color: palette.statusSuccess,
    },
  ];

  // Only add "Pending Sync" card if there are pending dispositions
  const pendingCard =
    pendingCount > 0
      ? [
          {
            type: "pending",
            label: "Pending Sync",
            value: pendingCount.toString(),
            icon: "time-outline",
            color: palette.statusWarning,
          },
        ]
      : [];

  const cards = [...baseCards, ...pendingCard];

  // Reset active card index if it's out of bounds (e.g., when pending card is removed)
  useEffect(() => {
    if (activeCardIndex >= cards.length && cards.length > 0) {
      setActiveCardIndex(cards.length - 1);
    }
  }, [cards.length, activeCardIndex]);

  const handleCardScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const cardWidth = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(contentOffset.x / cardWidth);
    setActiveCardIndex(index);
  };

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
            <View>
              <Text
                style={[styles.headerText, { color: palette.textSecondary }]}
              >
                Good afternoon
              </Text>
              {user?.name && (
                <Text style={[styles.userName, { color: palette.textPrimary }]}>
                  {user.name}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.statusBadge}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowStatusDropdown(true);
              }}
              activeOpacity={0.8}
            >
              {(() => {
                const status = STATUS_OPTIONS.find(
                  (s) => s.id === currentStatus
                );
                return (
                  <>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            palette[status?.color as keyof typeof palette] ||
                            palette.statusSuccess,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: palette.textPrimary },
                      ]}
                      numberOfLines={1}
                    >
                      {status?.label || "Available"}
                    </Text>
                  </>
                );
              })()}
            </TouchableOpacity>
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
              {notificationCount > 0 && (
                <View
                  style={[
                    styles.notificationBadge,
                    { backgroundColor: palette.statusError },
                  ]}
                >
                  <Text style={styles.notificationBadgeText}>
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Your main dashboard content - Swipeable Card */}
        <ScrollView
          ref={cardScrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleCardScroll}
          scrollEventThrottle={16}
          style={styles.cardScrollView}
        >
          {cards.map((card, index) => (
            <View key={card.type} style={styles.balanceCard}>
              <View style={styles.balanceHeader}>
                <View style={styles.balanceHeaderLeft}>
                  <Ionicons
                    name={card.icon as any}
                    size={18}
                    color={card.color}
                  />
                  <Text
                    style={[
                      styles.balanceLabel,
                      { color: palette.primaryLighter },
                    ]}
                  >
                    {card.label}
                  </Text>
                </View>
                {card.type === "total" && (
                  <Ionicons
                    name="eye-outline"
                    size={18}
                    color={palette.primaryLighter}
                  />
                )}
              </View>
              <Text
                style={[styles.balanceValue, { color: palette.textPrimary }]}
              >
                {card.value}
              </Text>
              {card.type === "total" && (
                <View style={styles.gainRow}>
                  <Text
                    style={[
                      styles.gainLabel,
                      { color: palette.primaryLighter },
                    ]}
                  >
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
              )}
            </View>
          ))}
        </ScrollView>

        <View style={styles.carouselDots}>
          {cards.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeCardIndex === index && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/modal/add-widget");
          }}
        >
          <Ionicons name="add-outline" size={18} color={palette.textInverse} />
          <Text style={styles.primaryButtonText}>Add widget</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Charts</Text>
        </View>

        {selectedWidgets.length === 0 ? (
          <View
            style={[
              styles.chartContainer,
              styles.emptyChartContainer,
              {
                backgroundColor: palette.accentWhite,
                borderColor: palette.mediumGray,
              },
            ]}
          >
            <Ionicons
              name="bar-chart-outline"
              size={64}
              color={palette.textSecondary}
            />
            <Text
              style={[styles.emptyChartText, { color: palette.textSecondary }]}
            >
              No charts added yet
            </Text>
            <Text
              style={[
                styles.emptyChartSubtext,
                { color: palette.textSecondary },
              ]}
            >
              Tap &quot;Add widget&quot; to add charts to your dashboard
            </Text>
          </View>
        ) : (
          selectedWidgets.map((widget) => (
            <View
              key={widget.id}
              style={[
                styles.chartContainer,
                {
                  backgroundColor: palette.accentWhite,
                  borderColor: palette.mediumGray,
                },
              ]}
            >
              {widget.type === "bar" ? (
                <BarChart
                  data={[28, 12, 45, 8, 32, 15, 20]}
                  width={SCREEN_WIDTH * 0.8}
                  height={220}
                  primaryColor={palette.interactivePrimary}
                  secondaryColor={palette.interactiveSecondary}
                  labelColor={palette.textSecondary}
                  axisColor={palette.mediumGray}
                  backgroundColor={palette.accentWhite}
                  showGrid={true}
                  gridCount={5}
                  showXAxisLabels={true}
                  showYAxisLabels={true}
                  formatLabel={(index: number) => {
                    const labels = [
                      "Mon",
                      "Tue",
                      "Wed",
                      "Thu",
                      "Fri",
                      "Sat",
                      "Sun",
                    ];
                    return labels[index] || "";
                  }}
                  style={styles.chart}
                />
              ) : widget.type === "line" ? (
                <LineChart
                  data={[28, 12, 45, 8, 32, 15, 20]}
                  width={SCREEN_WIDTH * 0.8}
                  height={220}
                  lineColor={palette.interactivePrimary}
                  labelColor={palette.textSecondary}
                  axisColor={palette.mediumGray}
                  backgroundColor={palette.accentWhite}
                  showGrid={true}
                  gridCount={5}
                  showXAxisLabels={true}
                  showYAxisLabels={true}
                  formatLabel={(index: number) => {
                    const labels = [
                      "Mon",
                      "Tue",
                      "Wed",
                      "Thu",
                      "Fri",
                      "Sat",
                      "Sun",
                    ];
                    return labels[index] || "";
                  }}
                  style={styles.chart}
                />
              ) : widget.type === "pie" ? (
                <PieChart
                  data={[
                    { value: 28, label: "Mon" },
                    { value: 12, label: "Tue" },
                    { value: 45, label: "Wed" },
                    { value: 8, label: "Thu" },
                    { value: 32, label: "Fri" },
                    { value: 15, label: "Sat" },
                    { value: 20, label: "Sun" },
                  ]}
                  width={SCREEN_WIDTH * 0.9}
                  height={400}
                  colors={[
                    palette.interactivePrimary,
                    palette.interactiveSecondary,
                    palette.statusSuccess,
                    palette.statusError,
                    palette.statusWarning,
                    palette.primaryLighter,
                    palette.mediumGray,
                  ]}
                  showLabels={true}
                  showPercentages={true}
                  animate={true}
                />
              ) : widget.type === "doughnut" ? (
                <PieChart
                  data={[
                    { value: 28, label: "Mon" },
                    { value: 12, label: "Tue" },
                    { value: 45, label: "Wed" },
                    { value: 8, label: "Thu" },
                    { value: 32, label: "Fri" },
                    { value: 15, label: "Sat" },
                    { value: 20, label: "Sun" },
                  ]}
                  width={SCREEN_WIDTH * 0.8}
                  height={220}
                  colors={[
                    palette.interactivePrimary,
                    palette.interactiveSecondary,
                    palette.statusSuccess,
                    palette.statusError,
                    palette.statusWarning,
                    palette.primaryLighter,
                    palette.mediumGray,
                  ]}
                  showLabels={true}
                  showPercentages={true}
                  animate={true}
                  strokeWidth={20}
                />
              ) : (
                <View
                  style={[
                    styles.chartPlaceholder,
                    { backgroundColor: palette.offWhite },
                  ]}
                >
                  <Ionicons
                    name={widget.icon}
                    size={48}
                    color={palette.textSecondary}
                  />
                  <Text
                    style={[
                      styles.chartPlaceholderText,
                      { color: palette.textSecondary },
                    ]}
                  >
                    {widget.name}
                  </Text>
                  <Text
                    style={[
                      styles.chartPlaceholderSubtext,
                      { color: palette.textSecondary },
                    ]}
                  >
                    Chart type coming soon
                  </Text>
                </View>
              )}
            </View>
          ))
        )}

        {/* Status Dropdown Modal */}
        <Modal
          visible={showStatusDropdown}
          transparent
          animationType="fade"
          onRequestClose={() => setShowStatusDropdown(false)}
        >
          <TouchableOpacity
            style={styles.statusModalOverlay}
            activeOpacity={1}
            onPress={() => setShowStatusDropdown(false)}
          >
            <View
              style={[
                styles.statusDropdown,
                {
                  backgroundColor: palette.accentWhite,
                  borderColor: palette.mediumGray,
                },
              ]}
            >
              {STATUS_OPTIONS.map((status) => {
                const isSelected = currentStatus === status.id;
                return (
                  <TouchableOpacity
                    key={status.id}
                    style={[
                      styles.statusOption,
                      isSelected && { backgroundColor: palette.offWhite2 },
                    ]}
                    onPress={async () => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setCurrentStatus(status.id);
                      try {
                        await AsyncStorage.setItem(
                          STATUS_STORAGE_KEY,
                          status.id
                        );
                      } catch (error) {
                        console.error("Error saving status:", error);
                      }
                      setShowStatusDropdown(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.statusOptionDot,
                        {
                          backgroundColor:
                            palette[status.color as keyof typeof palette] ||
                            palette.statusSuccess,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusOptionText,
                        {
                          color: isSelected
                            ? palette.interactivePrimary
                            : palette.textPrimary,
                          fontWeight: isSelected ? "600" : "400",
                        },
                      ]}
                    >
                      {status.label}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={palette.interactivePrimary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </Modal>

        <View style={styles.quoteCard}>
          <Text style={styles.quoteHeading}>MY NOTE</Text>
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

      {/*  Custom animated header (solid + instant appearance) */}
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
    userName: {
      fontSize: 18,
      fontWeight: "600",
      marginTop: 2,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 0,
      backgroundColor: palette.bgSecondary,
      gap: 8,
      marginRight: 8,
      minWidth: 100,
      height: 36,
    },
    statusDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: palette.accentWhite,
    },
    statusBadgeText: {
      fontSize: 12,
      fontWeight: "500",
      maxWidth: 120,
    },
    iconBadge: {
      width: 36,
      height: 36,
      borderRadius: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: palette.bgSecondary,
      position: "relative",
    },
    notificationBadge: {
      position: "absolute",
      top: 1,
      right: 2,
      minWidth: 16,
      height: 16,
      borderRadius: 9,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 3,
      borderWidth: 2,
      borderColor: palette.accentWhite,
    },
    notificationBadgeText: {
      color: palette.textInverse,
      fontSize: 8,
      fontWeight: "700",
      lineHeight: 12,
    },
    statusModalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-start",
      alignItems: "flex-end",
      paddingTop: 60,
      paddingRight: 16,
    },
    statusDropdown: {
      minWidth: 250,
      maxWidth: 300,
      borderRadius: 0,
      borderWidth: 1,
      shadowColor: palette.shadowColor,
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 4,
      overflow: "hidden",
    },
    statusOption: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: palette.mediumGray,
    },
    statusOptionDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: palette.accentWhite,
    },
    statusOptionText: {
      flex: 1,
      fontSize: 14,
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
    cardScrollView: {
      marginHorizontal: -20,
    },
    balanceCard: {
      width: 350,
      marginHorizontal: 20,
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
    balanceHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
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
    chartContainer: {
      // padding: 16,
      borderRadius: 0,
      borderWidth: 1,
      // overflow: "hidden",
    },
    emptyChartContainer: {
      justifyContent: "center",
      alignItems: "center",
      minHeight: 220,
      // gap: 12,
    },
    emptyChartText: {
      fontSize: 18,
      fontWeight: "600",
      marginTop: 8,
    },
    emptyChartSubtext: {
      fontSize: 14,
      fontWeight: "400",
      textAlign: "center",
      paddingHorizontal: 20,
    },
    chart: {
      borderRadius: 0,
    },
    chartPlaceholder: {
      width: SCREEN_WIDTH - 40,
      height: 220,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 0,
      gap: 12,
    },
    chartPlaceholderText: {
      fontSize: 18,
      fontWeight: "600",
    },
    chartPlaceholderSubtext: {
      fontSize: 12,
      fontWeight: "400",
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
      borderRadius: 0,
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
    planCopy: {
      gap: 6,
    },
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
      borderRadius: 0,
      backgroundColor: "rgba(255,255,255,0.15)",
      alignItems: "center",
      justifyContent: "center",
    },
  });
