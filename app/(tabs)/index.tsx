import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AnimatedHeader from "@/components/AnimatedHeader";
import DashboardHeader from "@/components/DashboardHeader";
import NoteCard from "@/components/NoteCard";
import PageTitle from "@/components/PageTitle";
import StatusBanner from "@/components/StatusBanner";
import SwipeableCard from "@/components/SwipeableCard";
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

  // Handle status selection
  const handleStatusSelect = async (statusId: string) => {
    try {
      setCurrentStatus(statusId);
      await AsyncStorage.setItem(STATUS_STORAGE_KEY, statusId);
    } catch (error) {
      console.error("Error saving status:", error);
    }
  };

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

  const noteCardRef = useRef<View>(null);
  const noteCardY = useRef<number>(0);
  const scrollViewInstance = useRef<any>(null);

  // Scroll to note card when keyboard appears
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        // Small delay to ensure layout is complete
        setTimeout(() => {
          if (noteCardY.current > 0 && scrollViewInstance.current) {
            scrollViewInstance.current.scrollTo({
              y: noteCardY.current - 20, // Add some padding
              animated: true,
            });
          }
        }, 100);
      }
    );

    return () => {
      keyboardWillShow.remove();
    };
  }, []);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle="light-content" translucent />
      <StatusBanner currentStatus={currentStatus} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Scrollable content */}
        <Animated.ScrollView
          ref={(ref) => {
            scrollViewInstance.current = ref;
          }}
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
        >
          <PageTitle title="Dashboard" />
          <DashboardHeader
            userName={user?.name}
            currentStatus={currentStatus}
            onStatusPress={handleStatusSelect}
            notificationCount={notificationCount}
          />

          <SwipeableCard cards={cards} />

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

          <View
            ref={noteCardRef}
            onLayout={(event) => {
              const { y } = event.nativeEvent.layout;
              noteCardY.current = y;
            }}
          >
            <NoteCard />
          </View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>

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
  });
