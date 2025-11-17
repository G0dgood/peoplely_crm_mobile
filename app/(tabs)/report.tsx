import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
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
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type AgentReport = {
  id: string;
  agentName: string;
  agentId: string;
  date: string;
  status: "Active" | "On Leave" | "Inactive";
  totalSales: number;
};

const REPORT_DATA: AgentReport[] = [
  {
    id: "1",
    agentName: "Sarah Johnson",
    agentId: "AGT-001",
    date: "2024-01-15",
    status: "Active",
    totalSales: 12840,
  },
  {
    id: "2",
    agentName: "Michael Chen",
    agentId: "AGT-002",
    date: "2024-01-16",
    status: "Active",
    totalSales: 11420,
  },
  {
    id: "3",
    agentName: "Emily Davis",
    agentId: "AGT-003",
    date: "2024-01-17",
    status: "On Leave",
    totalSales: 9020,
  },
  {
    id: "4",
    agentName: "James Wilson",
    agentId: "AGT-004",
    date: "2024-01-18",
    status: "Active",
    totalSales: 13800,
  },
  {
    id: "5",
    agentName: "Lisa Martinez",
    agentId: "AGT-005",
    date: "2024-01-19",
    status: "Inactive",
    totalSales: 7560,
  },
  {
    id: "6",
    agentName: "Robert Taylor",
    agentId: "AGT-006",
    date: "2024-01-20",
    status: "Active",
    totalSales: 11950,
  },
];

export default function ReportScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = useMemo(
    () => createStyles(palette, colorScheme),
    [palette, colorScheme]
  );

  // 👇 Animated scroll tracking
  const scrollY = useRef(new Animated.Value(0)).current;

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [numberOfItemsPerPageList] = useState([5, 10, 15, 40]);
  const [itemsPerPage, onItemsPerPageChange] = useState(
    numberOfItemsPerPageList[0]
  );
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState("all-time");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filteredData = REPORT_DATA.filter((row) => {
    const lowered = query.toLowerCase();
    return (
      row.agentName.toLowerCase().includes(lowered) ||
      row.agentId.toLowerCase().includes(lowered) ||
      row.status.toLowerCase().includes(lowered)
    );
  });

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, filteredData.length);
  const paginated = filteredData.slice(from, to);
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  useEffect(() => {
    setPage(0);
  }, [query, itemsPerPage]);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
    >
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
        <PageTitle title="Report" />

        <SearchField
          value={query}
          onChangeText={setQuery}
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

        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <DataTable style={[styles.table, { minWidth: 800 }]}>
            <DataTable.Header>
              <DataTable.Title
                textStyle={styles.columnLabel}
                style={styles.nameColumn}
              >
                Agent Name
              </DataTable.Title>
              <DataTable.Title
                textStyle={styles.columnLabel}
                style={styles.idColumn}
              >
                Agent ID
              </DataTable.Title>
              <DataTable.Title
                numeric
                textStyle={styles.columnLabel}
                style={styles.dateColumn}
              >
                Date
              </DataTable.Title>
              <DataTable.Title
                textStyle={styles.columnLabel}
                style={styles.statusColumn}
              >
                Status
              </DataTable.Title>
              <DataTable.Title
                numeric
                textStyle={styles.columnLabel}
                style={styles.salesColumn}
              >
                Total Sales
              </DataTable.Title>
            </DataTable.Header>

            {paginated.map((item) => (
              <DataTable.Row
                key={item.id}
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: palette.mediumGray,
                }}
              >
                <DataTable.Cell
                  textStyle={styles.rowText}
                  style={styles.nameColumn}
                >
                  {item.agentName}
                </DataTable.Cell>
                <DataTable.Cell
                  textStyle={styles.rowText}
                  style={styles.idColumn}
                >
                  {item.agentId}
                </DataTable.Cell>
                <DataTable.Cell
                  numeric
                  textStyle={styles.rowText}
                  style={styles.dateColumn}
                >
                  {item.date}
                </DataTable.Cell>
                <DataTable.Cell
                  style={[
                    styles.statusColumn,
                    styles.statusPill,
                    item.status === "Active"
                      ? styles.statusActive
                      : item.status === "Inactive"
                      ? styles.statusInactive
                      : styles.statusOnLeave,
                  ]}
                >
                  <View style={[]}>
                    <Text
                      style={[
                        styles.statusPillText,
                        item.status === "Active"
                          ? styles.statusPillTextActive
                          : item.status === "Inactive"
                          ? styles.statusPillTextInactive
                          : styles.statusPillTextOnLeave,
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </DataTable.Cell>
                <DataTable.Cell
                  numeric
                  textStyle={styles.rowText}
                  style={styles.salesColumn}
                >
                  ${item.totalSales.toLocaleString()}
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </ScrollView>

        <DataTable.Pagination
          page={page}
          numberOfPages={totalPages}
          onPageChange={(page) => setPage(page)}
          label={`${from + 1}-${to} of ${filteredData.length}`}
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
                  value={fromDate}
                  onChangeText={setFromDate}
                  placeholder="YYYY-MM-DD"
                  containerStyle={styles.dateInput}
                />
                <TextField
                  label="To Date"
                  value={toDate}
                  onChangeText={setToDate}
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
                  setShowFilterModal(false);
                  // TODO: Apply filter logic here
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
      paddingHorizontal: 8,
    },
    rowText: {
      fontSize: 15,
      color: palette.textPrimary,
      paddingVertical: 12,
      paddingHorizontal: 8,
    },
    nameColumn: {
      flex: 2,
      minWidth: 150,
      paddingHorizontal: 8,
    },
    idColumn: {
      flex: 1,
      minWidth: 100,
      paddingHorizontal: 8,
    },
    dateColumn: {
      flex: 1.2,
      minWidth: 120,
      justifyContent: "center",
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
