import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AnimatedHeader from "@/components/AnimatedHeader";
import DashboardHeader from "@/components/DashboardHeader";
import AddWidgetModal from "@/components/modals/AddWidgetModal";
import NoteCard from "@/components/NoteCard";
import PageTitle from "@/components/PageTitle";
import Skeleton from "@/components/Skeleton";
import StatusBanner from "@/components/StatusBanner";
import SwipeableCard from "@/components/SwipeableCard";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useDispositionSync } from "@/hooks/useDispositionSync";
import { useAppSelector } from "@/store/hooks";
import { useGetNotificationsByLineOfBusinessIdQuery } from "@/store/services/notificationApi";
import {
  useGetLineOfBusinessForTeamMemberQuery,
  useGetStatusesByLineOfBusinessQuery,
} from "@/store/services/teamMembersApi";
// @ts-ignore
import { BarChart, LineChart } from "expo-charts";
// @ts-ignore
import { useLineOfBusiness } from "@/contexts/LineOfBusinessContext";
import {
  generateChartData,
} from "@/utils/chartDataGenerator";
import {
  getOfflineDispositions,
  getSyncedDispositions,
} from "@/utils/dispositionStorage";
import { ChartDataItem } from "@/utils/types";
import PieChart from "expo-charts/dist/PieChart";
import { useRouter } from "expo-router";
import { filterDispositionsByTimeRange } from "../../utils/filterUtils";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const STATUS_STORAGE_KEY = "@user_status";

// Status options are fetched live from API; no local defaults

export default function DashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = React.useMemo(() => createStyles(palette), [palette]);
  const { user } = useAuth();
  const { selectedLineOfBusinessId } = useLineOfBusiness();



  const {
    data: lobData,
    isLoading: lobLoading,
    error: lobError,
    refetch: refetchLob,
  } = useGetLineOfBusinessForTeamMemberQuery(selectedLineOfBusinessId || "", {
    skip: !selectedLineOfBusinessId,
  });
  const {
    data: statusesData,
    refetch: refetchStatuses,
  } = useGetStatusesByLineOfBusinessQuery(selectedLineOfBusinessId || "", {
    skip: !selectedLineOfBusinessId,
  });

  const { refetch: refetchNotifications } =
    useGetNotificationsByLineOfBusinessIdQuery(selectedLineOfBusinessId || "", {
      skip: !selectedLineOfBusinessId,
    });


  //  Animated scroll tracking
  const scrollY = useRef(new Animated.Value(0)).current;

  // Status management
  const [currentStatus, setCurrentStatus] = useState<string>("available");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showAddWidgetModal, setShowAddWidgetModal] = useState(false);

  // Notification count from slice
  const notificationCount = useAppSelector(
    (state) => state.notification.unreadCount
  );
  const [refreshing, setRefreshing] = useState(false);

  // Sync dispositions from AsyncStorage to Redux
  const { loadDispositionsIntoRedux } = useDispositionSync();

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Promise.all([
        refetchLob(),
        refetchStatuses(),
        refetchNotifications(),
        loadStatus(),
        loadDispositionsIntoRedux(),
      ]);
    } catch (error) {
      console.error("Error refreshing dashboard:", error);
    } finally {
      setRefreshing(false);
    }
  }, [
    refetchLob,
    refetchStatuses,
    refetchNotifications,
    loadDispositionsIntoRedux,
  ]);

  // Get pending dispositions from Redux store
  const pendingDispositions = useAppSelector(
    (state) => state.disposition.pendingDispositions
  );
  const pendingCount = pendingDispositions.length;
  // @ts-ignore
  const apiDispositions = lobData?.lineOfBusiness?.dispositions || [];
  // @ts-ignore
  const dashboardSettings = useMemo(() => lobData?.lineOfBusiness?.dashboardSettings || {}, [lobData]);

  // Use state to hold the resolved dispositions
  const [resolvedCombinedDispositions, setResolvedCombinedDispositions] = useState<any[]>([]);

  // Effect to load and combine dispositions
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const offline = await getOfflineDispositions();

        // If we have API data, use it as the source of "synced" data
        // Otherwise fallback to local synced data
        const synced = Array.isArray(apiDispositions) && apiDispositions.length > 0
          ? apiDispositions
          : await getSyncedDispositions();

        if (isMounted) {
          // @ts-ignore
          setResolvedCombinedDispositions([...offline, ...synced]);
        }
      } catch (error) {
        console.error("Error loading dispositions:", error);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
    // Depend on apiDispositions length to avoid loop if array reference changes but content doesn't
    // Also depend on pendingCount to refresh when pending items change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiDispositions?.length, pendingCount]);

  // Get widgets from context and update values dynamically based on disposition data
  const widgets = useMemo(() => {
    // Filter dispositions based on time range
    const timeRange =
      dashboardSettings.dispositionSettings?.timeRangeView || "daily";
    const filteredDispositions = filterDispositionsByTimeRange(
      resolvedCombinedDispositions,
      timeRange
    );

    // Calculate disposition field counts
    const calculateDispositionFieldCount = (fieldName: string): number => {
      return filteredDispositions.filter((disp) => {
        // Check dispositionData array
        // @ts-ignore
        if (disp.dispositionData && Array.isArray(disp.dispositionData)) {
          // @ts-ignore
          const field = disp.dispositionData.find(
            (f: any) => f.fieldName === fieldName
          );
          if (field) {
            const value = field.fieldValue;
            return value && value.toString().trim() !== "" && value !== "-";
          }
        }

        // Fallback for direct property access (legacy support)
        // @ts-ignore
        const fieldValue = disp[fieldName];
        return (
          fieldValue && String(fieldValue).trim() !== "" && fieldValue !== "-"
        );
      }).length;
    };

    return dashboardSettings?.widgets?.map((widget: any) => {
      // Update pending dispositions widget value
      if (widget.title === "Pending Dispositions") {
        return { ...widget, value: pendingCount };
      }

      // Update total dispositions widget value
      if (
        widget.title === "Total Dispositions" ||
        widget.title === "Total Calls"
      ) {
        return { ...widget, value: filteredDispositions.length };
      }

      // Check if widget title corresponds to a disposition field
      // We check if the widget title matches any disposition name in the settings
      const isDispositionField = dashboardSettings.dispositions?.some(
        (d: any) => d.name === widget.title
      );

      if (isDispositionField) {
        return {
          ...widget,
          value: calculateDispositionFieldCount(widget.title),
        };
      }

      // Check if widget title corresponds to a call outcome
      const isCallOutcome = dashboardSettings.callOutcomes?.some(
        (o: any) => o.name.toLowerCase() === widget.title.toLowerCase()
      );

      if (isCallOutcome) {
        const count = filteredDispositions.filter((disp) => {
          // @ts-ignore
          if (disp.dispositionData && Array.isArray(disp.dispositionData)) {
            // @ts-ignore
            return disp.dispositionData.some(
              (f: any) =>
                f.fieldValue &&
                f.fieldValue.toString().toLowerCase() ===
                widget.title.toLowerCase()
            );
          }
          return false;
        }).length;
        return { ...widget, value: count };
      }

      return widget;
    });
  }, [dashboardSettings, resolvedCombinedDispositions, pendingCount]);

  // Wrapper function to generate chart data using the utility function
  const generateChartDataWrapper = (
    dataSource: string | string[],
    chartColor?: string,
    colors?: Record<string, string>
  ): ChartDataItem[] => {
    return generateChartData(
      dataSource,
      chartColor,
      { dashboardSettings },
      pendingCount,
      colors,
      resolvedCombinedDispositions
    );
  };

  // Load saved status on mount
  useEffect(() => {
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

  // Reload widgets when screen comes into focus (returning from modal)
  useFocusEffect(
    useCallback(() => {
      loadDispositionsIntoRedux();
    }, [loadDispositionsIntoRedux])
  );

  // Build cards array - conditionally include "Pending Sync" only when there are pending items
  const baseCards =
    widgets && widgets.length > 0
      ? widgets.map((w: any) => {
        const title = String(w?.title || "").toLowerCase();
        const icon = title.includes("total")
          ? "call-outline"
          : title.includes("fail")
            ? "close-circle"
            : title.includes("success")
              ? "checkmark-circle"
              : "bar-chart-outline";
        return {
          type: w?.id || title || "widget",
          label: w?.title || "Widget",
          value: String(w?.value ?? "0"),
          icon,
          color: w?.color || palette.interactivePrimary,
        };
      })
      : [
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.headerRow}>
            <PageTitle
              title={
                lobData?.lineOfBusiness?.dashboardSettings?.dashboardName ||
                "Dashboard"
              }
            />
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
          <DashboardHeader
            userName={user?.name}
            currentStatus={currentStatus}
            onStatusPress={handleStatusSelect}
            notificationCount={notificationCount}
          />

          {lobLoading ? (
            <View style={{ alignItems: "center", marginBottom: 24 }}>
              <Skeleton
                width={SCREEN_WIDTH * 0.9}
                height={140}
                borderRadius={0}
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  marginTop: 12,
                  paddingHorizontal: 20,
                }}
              >
                <View style={{ flexDirection: "row", gap: 6 }}>
                  <Skeleton width={6} height={6} borderRadius={3} />
                  <Skeleton width={6} height={6} borderRadius={3} />
                  <Skeleton width={6} height={6} borderRadius={3} />
                </View>
                <Skeleton width={100} height={32} borderRadius={0} />
              </View>
            </View>
          ) : (
            <SwipeableCard
              cards={cards}
              onAddWidget={() => setShowAddWidgetModal(true)}
            />
          )}

          <View style={styles.sectionHeader}>
            {lobLoading ? (
              <Skeleton width={120} height={24} borderRadius={4} />
            ) : (
              <Text style={styles.sectionTitle}>
                {lobError
                  ? "Charts"
                  : lobData?.lineOfBusiness?.dashboardSettings?.activeTab ===
                    "disposition"
                    ? "Dispositions"
                    : "Charts"}
              </Text>
            )}
          </View>

          {(dashboardSettings?.dispositionSettings?.charts || []).length === 0 ? (
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
                style={[
                  styles.emptyChartText,
                  { color: palette.textSecondary },
                ]}
              >
                No charts added yet
              </Text>
              <Text
                style={[
                  styles.emptyChartSubtext,
                  { color: palette.textSecondary },
                ]}
              >
                Configure charts in your dashboard settings
              </Text>
            </View>
          ) : (
            (dashboardSettings?.dispositionSettings?.charts || []).map((chart: any) => {
              // Generate data for Bar, Line, and Pie charts
              let chartData: any[] = [];
              if (["bar", "line", "pie", "doughnut"].includes(chart.type)) {
                chartData = generateChartDataWrapper(
                  chart.dataSource || [],
                  chart.color || palette.interactivePrimary,
                  chart.colors
                );
                chartData = (chartData || []).map((d: any) => ({
                  ...d,
                  value: Math.max(0, typeof d.value === "number" ? d.value : Number(d.value) || 0),
                }));
              }

              // Check if data is available for these chart types
              const isDataEmpty = ["bar", "line", "pie", "doughnut"].includes(chart.type) && (!chartData || chartData.length === 0);
              const totalValue = (chartData || []).reduce((sum: number, d: any) => sum + (Number(d?.value) || 0), 0);
              const isNoValueForPie = ["pie", "doughnut"].includes(chart.type) && totalValue <= 0;
              const maxValue = (chartData || []).reduce((max: number, d: any) => Math.max(max, Number(d?.value) || 0), 0);
              const isNoValueForBarLine = ["bar", "line"].includes(chart.type) && maxValue <= 0;

              if ((isDataEmpty || isNoValueForPie || isNoValueForBarLine) && ["bar", "line", "pie", "doughnut"].includes(chart.type)) {
                return (
                  <View
                    key={chart.id}
                    style={[
                      styles.chartContainer,
                      styles.emptyChartContainer,
                      {
                        backgroundColor: palette.accentWhite,
                        borderColor: palette.mediumGray,
                        height: 220,
                        justifyContent: "center",
                        alignItems: "center",
                      },
                    ]}
                  >
                    <Ionicons
                      name={chart.type === "pie" || chart.type === "doughnut" ? "pie-chart-outline" : "bar-chart-outline"}
                      size={48}
                      color={palette.mediumGray}
                    />
                    <Text style={{ color: palette.textSecondary, marginTop: 12 }}>
                      No data available for {chart.title}
                    </Text>
                  </View>
                );
              }

              return (
                <View
                  key={chart.id}
                  style={[
                    styles.chartContainer,
                    {
                      backgroundColor: palette.accentWhite,
                      borderColor: palette.mediumGray,
                    },
                  ]}
                >
                  <Text style={[styles.sectionTitle, { fontSize: 16, marginBottom: 10, marginLeft: 10 }]}>
                    {chart.title}
                  </Text>
                  {chart.type === "bar" ? (
                    <BarChart
                      data={chartData}
                      width={SCREEN_WIDTH * 0.8}
                      height={220}
                      primaryColor={chart.color || palette.interactivePrimary}
                      secondaryColor={palette.interactiveSecondary}
                      labelColor={palette.textSecondary}
                      axisColor={palette.mediumGray}
                      backgroundColor={palette.accentWhite}
                      showGrid={true}
                      gridCount={5}
                      showXAxisLabels={true}
                      showYAxisLabels={true}
                      formatLabel={(index: number) => {
                        return chartData[index]?.label || "";
                      }}
                      style={styles.chart}
                    />
                  ) : chart.type === "line" ? (
                    <LineChart
                      data={chartData}
                      width={SCREEN_WIDTH * 0.8}
                      height={220}
                      lineColor={chart.color || palette.interactivePrimary}
                      labelColor={palette.textSecondary}
                      axisColor={palette.mediumGray}
                      backgroundColor={palette.accentWhite}
                      showGrid={true}
                      gridCount={5}
                      showXAxisLabels={true}
                      showYAxisLabels={true}
                      formatLabel={(index: number) => {
                        return chartData[index]?.label || "";
                      }}
                      style={styles.chart}
                    />
                  ) : chart.type === "pie" ? (
                    <PieChart
                      data={chartData}
                      width={SCREEN_WIDTH * 0.9}
                      height={400}
                      colors={chartData.map(d => d.color || chart.color || palette.interactivePrimary)}
                      showLabels={true}
                      showPercentages={true}
                      animate={true}
                    />
                  ) : chart.type === "doughnut" ? (
                    <PieChart
                      data={chartData}
                      width={SCREEN_WIDTH * 0.9}
                      height={400}
                      colors={chartData.map(d => d.color || chart.color || palette.interactivePrimary)}
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
                        name="bar-chart-outline"
                        size={48}
                        color={palette.textSecondary}
                      />
                      <Text
                        style={[
                          styles.chartPlaceholderText,
                          { color: palette.textSecondary },
                        ]}
                      >
                        {chart.title} ({chart.type})
                      </Text>
                      <Text style={{ color: palette.textSecondary, fontSize: 12 }}>
                        Chart type not supported on mobile
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
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
                {(statusesData?.statuses || []).map((s: any) => {
                  const status = {
                    id: String(s?.statusId || s?._id || s?.name || ""),
                    label: String(s?.name || ""),
                    colorHex: s?.color as string | undefined,
                  };
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
                              status.colorHex || palette.statusSuccess,
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

      <AddWidgetModal
        visible={showAddWidgetModal}
        onClose={() => setShowAddWidgetModal(false)}
        onWidgetsUpdated={() => loadDispositionsIntoRedux()}
      />
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
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
  });
