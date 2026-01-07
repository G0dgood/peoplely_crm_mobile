import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { DataTable } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import AnimatedHeader from "@/components/AnimatedHeader";
import TextField from "@/components/forms/TextField";
import PageTitle from "@/components/PageTitle";
import SearchField from "@/components/SearchField";
import Skeleton from "@/components/Skeleton";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useLineOfBusiness } from "@/contexts/LineOfBusinessContext";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  useGetDispositionsByAgentReportQuery,
  useGetDispositionsByLineOfBusinessReportQuery,
} from "@/store/services/dispositionApi";

type DispositionField = {
  fieldName: string;
  fieldValue: string | number | boolean | null;
};
type ReportItem = {
  _id?: string;
  id?: string;
  agent?: { name?: string; id?: string };
  timestamp?: string;
  fillDisposition?: DispositionField[];
  [key: string]: any;
};
type ReportData = {
  id: string;
  [key: string]: any;
};



export default function ReportScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = useMemo(
    () => createStyles(palette, colorScheme),
    [palette, colorScheme]
  );
  const { user } = useAuth();
  const { selectedLineOfBusinessId } = useLineOfBusiness();
  const { userPrivileges, isLoading: isPrivilegeLoading, isAdmin, isSuperAdmin } = usePrivilege();

  // Animated scroll tracking
  const scrollY = useRef(new Animated.Value(0)).current;

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [numberOfItemsPerPageList] = useState([5, 10, 15, 40]);
  const [itemsPerPage, onItemsPerPageChange] = useState(
    numberOfItemsPerPageList[0]
  );
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState("today");

  const roleNameLower = (userPrivileges?.role?.roleName || "").toLowerCase();
  const isAgent = roleNameLower === "agent";
  const isSupervisor = roleNameLower === "supervisor" || isAdmin || isSuperAdmin;

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>(() => {
    const today = formatDate(new Date());
    return { startDate: `${today}T00:00:00.000Z`, endDate: `${today}T23:59:59.999Z` };
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterButtonRef = useRef<View>(null);
  const [tooltipLength, setTooltipLength] = useState(10);
  const [filterType, setFilterType] = useState<"today" | "yesterday" | "last7days" | "last30days" | "all" | "dateRange">("today");
  const [customFromDate, setCustomFromDate] = useState("");
  const [customToDate, setCustomToDate] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCellText, setSelectedCellText] = useState("");
  const [showTextModal, setShowTextModal] = useState(false);

  const {
    data: agentReportData,
    refetch: refetchAgentReport,
    isFetching: isFetchingAgent,
    isLoading: isAgentLoading,
  } = useGetDispositionsByAgentReportQuery(
    {
      lineOfBusinessId: selectedLineOfBusinessId || "",
      agentId: user?.id || "",
      page: currentPage,
      limit: itemsPerPage,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    },
    { skip: isPrivilegeLoading || !isAgent || !selectedLineOfBusinessId || !user?.id }
  );

  const {
    data: lobReportData,
    refetch: refetchLobReport,
    isFetching: isFetchingLob,
    isLoading: isLobLoading,
  } = useGetDispositionsByLineOfBusinessReportQuery(
    {
      lineOfBusinessId: selectedLineOfBusinessId || "",
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    },
    { skip: isPrivilegeLoading || !isSupervisor || !selectedLineOfBusinessId }
  );

  const sourceData: any[] = useMemo(() => {
    const remote =
      (isAgent ? agentReportData : lobReportData) as any;
    const list =
      (remote && (remote.items || remote.data)) ||
      (Array.isArray(remote) ? remote : []);
    if (Array.isArray(list) && list.length > 0) return list as any[];
    return [] as any[];
  }, [isAgent, agentReportData, lobReportData]);

  useEffect(() => {
    AsyncStorage.getItem("report_tooltip_length").then((saved) => {
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0) {
          setTooltipLength(parsed);
        }
      }
    });
  }, []);

  const apiData = (isAgent ? agentReportData : lobReportData) as any;
  const isLoading = isPrivilegeLoading || ((isFetchingAgent || isFetchingLob) && !isRefreshing);
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (isAgent) {
        if (selectedLineOfBusinessId && user?.id) {
          await refetchAgentReport();
        }
      } else if (isSupervisor) {
        if (selectedLineOfBusinessId) {
          await refetchLobReport();
        }
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const reportData: ReportData[] = useMemo(() => {
    if (!apiData) return [];
    let list: ReportItem[] = [];
    if (Array.isArray(apiData)) {
      list = apiData as ReportItem[];
    } else if ("data" in apiData && Array.isArray(apiData.data)) {
      list = apiData.data as ReportItem[];
    }
    return list.map((item: ReportItem) => {
      const row: ReportData = {
        id: item._id || item.id || "",
        "Agent Name": item.agent?.name || "Unknown",
        "Date": item.timestamp
          ? new Date(item.timestamp).toLocaleDateString() +
          " " +
          new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "-",
      };
      if (Array.isArray(item.fillDisposition)) {
        item.fillDisposition.forEach((field: DispositionField) => {
          if (field.fieldName) {
            row[field.fieldName] = field.fieldValue;
          }
        });
      }
      return row;
    });
  }, [apiData]);

  const dynamicHeaders = useMemo(() => {
    if (reportData.length === 0) return [];
    const headers = new Set<string>();
    const priorityHeaders = ["Agent Name", "Date"];
    reportData.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (key !== "id" && key !== "_id") {
          headers.add(key);
        }
      });
    });
    return Array.from(headers).sort((a, b) => {
      const indexA = priorityHeaders.indexOf(a);
      const indexB = priorityHeaders.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [reportData]);

  const filteredReports = reportData.filter((report) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return Object.values(report).some((value) =>
      String(value).toLowerCase().includes(searchLower)
    );
  });

  const totalPages =
    isAgent ? ((!Array.isArray(apiData) && apiData?.totalPages) || 1) : Math.ceil(filteredReports.length / 10);
  const startIndex = isAgent ? 0 : (currentPage - 1) * 10;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + 10);


  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
    >
      {/* Scrollable content */}
      <Animated.ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={palette.interactivePrimary}
            colors={[palette.interactivePrimary]}
            progressBackgroundColor={palette.accentWhite}
          />
        }
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        <PageTitle title="Report" />

        <SearchField
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search"
          autoCorrect={false}
        />

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowFilterModal(true);
            }}
          >
            <Ionicons
              name="options-outline"
              size={18}
              color={palette.textPrimary}
            />
            <Text style={styles.filterButtonText}>Filter Report</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.downloadButton}>
            <Text style={styles.downloadButtonText}>Download</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={[styles.table, { minWidth: 600, padding: 12 }]}>
            <View style={{ flexDirection: "row" }}>
              {Array.from({ length: Math.max(3, dynamicHeaders.length || 5) }).map(
                (_, i) => (
                  <View
                    key={i}
                    style={{ width: 150, paddingHorizontal: 8 }}
                  >
                    <Skeleton width={"70%"} height={14} style={{ marginVertical: 12 }} />
                  </View>
                )
              )}
            </View>
            {Array.from({ length: 6 }).map((_, rowIdx) => (
              <View
                key={rowIdx}
                style={{
                  flexDirection: "row",
                  borderBottomWidth: 1,
                  borderBottomColor: palette.mediumGray,
                }}
              >
                {Array.from({ length: Math.max(3, dynamicHeaders.length || 5) }).map(
                  (_, colIdx) => (
                    <View
                      key={colIdx}
                      style={{ width: 150, paddingHorizontal: 8 }}
                    >
                      <Skeleton width={"80%"} height={16} style={{ marginVertical: 12 }} />
                    </View>
                  )
                )}
              </View>
            ))}
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <DataTable
              style={[
                styles.table,
                {
                  minWidth: Math.max(
                    600,
                    dynamicHeaders.length * 150
                  ),
                },
              ]}
            >
              <DataTable.Header>
                {dynamicHeaders.map((header) => (
                  <DataTable.Title
                    key={header}
                    textStyle={styles.columnLabel}
                    style={{ width: 150, paddingHorizontal: 8 }}
                  >
                    {header}
                  </DataTable.Title>
                ))}
              </DataTable.Header>

              {paginatedReports.map((item) => (
                <DataTable.Row
                  key={item.id || String(Math.random())}
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: palette.mediumGray,
                  }}
                >
                  {dynamicHeaders.map((header) => {
                    const cellValue = String(item[header] ?? "-");
                    const shouldTruncate = cellValue.length > 10;
                    const displayValue = shouldTruncate
                      ? cellValue.substring(0, 10) + "..."
                      : cellValue;

                    return (
                      <DataTable.Cell
                        key={header}
                        textStyle={styles.rowText}
                        style={{ width: 150, paddingHorizontal: 8 }}
                        onPress={() => {
                          if (shouldTruncate) {
                            setSelectedCellText(cellValue);
                            setShowTextModal(true);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }
                        }}
                      >
                        {displayValue}
                      </DataTable.Cell>
                    );
                  })}
                </DataTable.Row>
              ))}
            </DataTable>
          </ScrollView>
        )}

        <DataTable.Pagination
          page={isAgent ? currentPage - 1 : currentPage - 1}
          numberOfPages={Math.max(1, totalPages)}
          onPageChange={(p) => setCurrentPage(p + 1)}
          label={
            isAgent
              ? `Page ${currentPage} of ${Math.max(1, totalPages)}`
              : `${startIndex + 1}-${Math.min(startIndex + 10, filteredReports.length)} of ${filteredReports.length}`
          }
          numberOfItemsPerPageList={numberOfItemsPerPageList}
          numberOfItemsPerPage={itemsPerPage}
          onItemsPerPageChange={onItemsPerPageChange}
          showFastPaginationControls
          selectPageDropdownLabel={"Rows per page"}
          theme={{
            roundness: 0,
            colors: {
              primary: palette.interactivePrimary,
              text: palette.textPrimary,
              placeholder: palette.textSecondary,
              backdrop:
                colorScheme === "dark"
                  ? palette.background
                  : palette.accentWhite,
              surface:
                colorScheme === "dark"
                  ? palette.bgPrimary
                  : palette.accentWhite,
              onSurface: palette.textPrimary,
            },
          }}
        />
      </Animated.ScrollView>
      <AnimatedHeader title="Report" scrollY={scrollY} />

      {/* Date Range Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <TouchableOpacity
            style={[
              styles.modalContent,
              { backgroundColor: palette.accentWhite },
            ]}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.radioGroup}>
              {[
                { value: "today", label: "Today" },
                { value: "yesterday", label: "Yesterday" },
                { value: "last-7", label: "Last 7 days" },
                { value: "last-30", label: "Last 30 days" },
                { value: "all-time", label: "All time record" },
                { value: "date-range", label: "Date Range" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.radioOption}
                  onPress={() => setSelectedDateRange(option.value)}
                >
                  <View
                    style={[
                      styles.radioButton,
                      { borderColor: palette.mediumGray },
                    ]}
                  >
                    {selectedDateRange === option.value && (
                      <View
                        style={[
                          styles.radioButtonInner,
                          { backgroundColor: palette.interactivePrimary },
                        ]}
                      />
                    )}
                  </View>
                  <Text
                    style={[styles.radioLabel, { color: palette.textPrimary }]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedDateRange === "date-range" && (
              <View style={styles.dateRangeContainer}>
                <TextField
                  label="From Date"
                  value={customFromDate}
                  onChangeText={setCustomFromDate}
                  placeholder="YYYY-MM-DD"
                  containerStyle={styles.dateInput}
                />
                <TextField
                  label="To Date"
                  value={customToDate}
                  onChangeText={setCustomToDate}
                  placeholder="YYYY-MM-DD"
                  containerStyle={styles.dateInput}
                />
              </View>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.applyButton,
                  {
                    backgroundColor: palette.interactivePrimary,
                    borderColor: palette.interactivePrimary,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  const now = new Date();
                  const todayStr = formatDate(now);
                  let start = `${todayStr}T00:00:00.000Z`;
                  let end = `${todayStr}T23:59:59.999Z`;
                  if (selectedDateRange === "yesterday") {
                    const y = new Date();
                    y.setDate(y.getDate() - 1);
                    const ys = formatDate(y);
                    start = `${ys}T00:00:00.000Z`;
                    end = `${ys}T23:59:59.999Z`;
                  } else if (selectedDateRange === "last-7") {
                    const s = new Date();
                    s.setDate(s.getDate() - 6);
                    start = `${formatDate(s)}T00:00:00.000Z`;
                    end = `${todayStr}T23:59:59.999Z`;
                  } else if (selectedDateRange === "last-30") {
                    const s = new Date();
                    s.setDate(s.getDate() - 29);
                    start = `${formatDate(s)}T00:00:00.000Z`;
                    end = `${todayStr}T23:59:59.999Z`;
                  } else if (selectedDateRange === "all-time") {
                    start = `1970-01-01T00:00:00.000Z`;
                    end = `${todayStr}T23:59:59.999Z`;
                  } else if (selectedDateRange === "date-range") {
                    if (customFromDate) {
                      start = `${customFromDate}T00:00:00.000Z`;
                    }
                    if (customToDate) {
                      end = `${customToDate}T23:59:59.999Z`;
                    }
                  }
                  setDateRange({ startDate: start, endDate: end });
                  setCurrentPage(1);
                  setShowFilterModal(false);
                }}
              >
                <Text
                  style={[
                    styles.applyButtonText,
                    { color: palette.textInverse },
                  ]}
                >
                  Apply
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      {/* Text Detail Modal */}
      <Modal
        visible={showTextModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTextModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTextModal(false)}
        >
          <TouchableOpacity
            style={[
              styles.modalContent,
              { backgroundColor: palette.accentWhite },
            ]}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView style={{ maxHeight: 300 }}>
              <Text style={{ color: palette.textPrimary, fontSize: 16, lineHeight: 24 }}>
                {selectedCellText}
              </Text>
            </ScrollView>
            <View style={[styles.modalFooter, { marginTop: 20 }]}>
              <TouchableOpacity
                style={[
                  styles.applyButton,
                  {
                    backgroundColor: palette.interactivePrimary,
                    borderColor: palette.interactivePrimary,
                  },
                ]}
                onPress={() => setShowTextModal(false)}
              >
                <Text
                  style={[
                    styles.applyButtonText,
                    { color: palette.textInverse },
                  ]}
                >
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (
  palette: (typeof Colors)["light"],
  colorScheme: "light" | "dark"
) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    container: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 32,
      gap: 20,
    },
    actionsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      justifyContent: "flex-end",
    },
    filterButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 18,
      paddingVertical: 12,
      backgroundColor: palette.accentWhite,
      borderWidth: 1,
      borderColor: palette.mediumGray,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 12,
      elevation: 2,
    },
    filterButtonText: {
      fontWeight: "600",
      color: palette.textPrimary,
    },
    searchField: {
      flex: 1,
    },
    downloadButton: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: palette.interactivePrimary,
      borderWidth: 1,
      borderColor: palette.interactivePrimary,
    },
    downloadButtonText: {
      color: palette.textInverse,
      fontWeight: "600",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContent: {
      width: "100%",
      maxWidth: 400,
      borderRadius: 0,
      padding: 24,
      gap: 20,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
    },
    modalCloseButton: {
      padding: 4,
    },
    radioGroup: {
      gap: 16,
    },
    radioOption: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    radioButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      justifyContent: "center",
      alignItems: "center",
    },
    radioButtonInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    radioLabel: {
      fontSize: 15,
      fontWeight: "400",
    },
    dateRangeContainer: {
      gap: 16,
      marginTop: 8,
    },
    dateInput: {
      width: "100%",
    },
    modalFooter: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 8,
    },
    applyButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 0,
      borderWidth: 1,
    },
    applyButtonText: {
      fontSize: 15,
      fontWeight: "600",
    },
    table: {
      backgroundColor: palette.accentWhite,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 16,
      elevation: 2,
      borderRadius: 0,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: palette.mediumGray,
    },
    columnLabel: {
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      color: palette.textSecondary,
      letterSpacing: 0.5,
      paddingHorizontal: 5,
    },
    rowText: {
      fontSize: 14,
      color: palette.textPrimary,
      paddingVertical: 12,
      paddingHorizontal: 8,
    },
    nameColumn: {
      flex: 2,
      minWidth: 150,
      justifyContent: "flex-start",
      alignItems: "center",
      paddingHorizontal: 8,
    },
    idColumn: {
      flex: 1,
      minWidth: 100,
      justifyContent: "flex-start",
      alignItems: "center",
      paddingHorizontal: 8,
    },
    dateColumn: {
      flex: 1.2,
      minWidth: 120,
      justifyContent: "flex-start",
      alignItems: "center",
      paddingHorizontal: 8,
    },
    statusColumn: {
      flex: 1.2,
      minWidth: 120,
      justifyContent: "center",
      paddingHorizontal: 8,
    },
    salesColumn: {
      flex: 1.3,
      minWidth: 130,
      justifyContent: "flex-end",
      paddingHorizontal: 8,
    },
    statusPill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      alignItems: "center",
      justifyContent: "center",
      // borderWidth: 1,
    },
    statusActive: {
      backgroundColor:
        colorScheme === "dark"
          ? "rgba(108, 139, 125, 0.2)"
          : "rgba(108, 139, 125, 0.1)",
      // borderColor: palette.statusSuccess,
    },
    statusInactive: {
      backgroundColor:
        colorScheme === "dark"
          ? "rgba(220, 53, 69, 0.2)"
          : "rgba(220, 53, 69, 0.1)",
      // borderColor: palette.statusError,
    },
    statusOnLeave: {
      backgroundColor:
        colorScheme === "dark"
          ? "rgba(253, 126, 20, 0.2)"
          : "rgba(253, 126, 20, 0.1)",
      // borderColor: palette.statusWarning,
    },
    statusPillText: {
      fontSize: 12,
      fontWeight: "600",
    },
    statusPillTextActive: {
      color: palette.statusSuccess,
    },
    statusPillTextInactive: {
      color: palette.statusError,
    },
    statusPillTextOnLeave: {
      color: palette.statusWarning,
    },
  });
