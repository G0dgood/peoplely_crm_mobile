import { Ionicons } from "@expo/vector-icons";

import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { DataTable } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import AnimatedHeader from "@/components/AnimatedHeader";
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
  const styles = useMemo(() => createStyles(palette), [palette]);

  // 👇 Animated scroll tracking
  const scrollY = useRef(new Animated.Value(0)).current;

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const itemsPerPage = 6;

  const filteredData = REPORT_DATA.filter((row) => {
    const lowered = query.toLowerCase();
    return (
      row.agentName.toLowerCase().includes(lowered) ||
      row.agentId.toLowerCase().includes(lowered) ||
      row.status.toLowerCase().includes(lowered)
    );
  });

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

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons
              name="options-outline"
              size={18}
              color={palette.textPrimary}
            />
            <Text style={styles.filterButtonText}>Filter Report</Text>
          </TouchableOpacity>
          {/* <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder="Search"
            autoCorrect={false}
            containerStyle={styles.searchField}
          /> */}
          <TouchableOpacity style={styles.downloadButton}>
            <Text style={styles.downloadButtonText}>Download</Text>
          </TouchableOpacity>
        </View>

        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder="Search"
          autoCorrect={false}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tableWrapper}>
            <DataTable style={styles.table}>
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

              {filteredData
                .slice(page * itemsPerPage, page * itemsPerPage + itemsPerPage)
                .map((item) => (
                  <DataTable.Row key={item.id}>
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
                    <DataTable.Cell style={styles.statusColumn}>
                      <View
                        style={[
                          styles.statusPill,
                          item.status === "Active"
                            ? styles.statusActive
                            : item.status === "Inactive"
                            ? styles.statusInactive
                            : styles.statusOnLeave,
                        ]}
                      >
                        <Text style={styles.statusPillText}>{item.status}</Text>
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

              <DataTable.Pagination
                page={page}
                numberOfPages={Math.ceil(filteredData.length / itemsPerPage)}
                onPageChange={setPage}
                label={`${page * itemsPerPage + 1}-${Math.min(
                  (page + 1) * itemsPerPage,
                  filteredData.length
                )} of ${filteredData.length}`}
                showFastPaginationControls
                numberOfItemsPerPage={itemsPerPage}
              />
            </DataTable>
          </View>
        </ScrollView>
      </Animated.ScrollView>
      <AnimatedHeader title="Report" scrollY={scrollY} />
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
      backgroundColor: palette.primary,
    },
    downloadButtonText: {
      color: palette.textInverse,
      fontWeight: "600",
    },
    table: {
      backgroundColor: palette.accentWhite,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 16,
      elevation: 2,
    },
    tableWrapper: {
      minWidth: "100%",
      paddingBottom: 8,
    },
    columnLabel: {
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      color: palette.textSecondary,
      letterSpacing: 0.5,
    },
    rowText: {
      fontSize: 15,
      color: palette.textPrimary,
    },
    nameColumn: {
      flex: 2,
    },
    idColumn: {
      flex: 1,
    },
    dateColumn: {
      flex: 1.2,
      justifyContent: "center",
    },
    statusColumn: {
      flex: 1.2,
      justifyContent: "center",
    },
    salesColumn: {
      flex: 1.3,
      justifyContent: "flex-end",
    },
    statusPill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      alignItems: "center",
      justifyContent: "center",
    },
    statusActive: {
      backgroundColor: "#DCFCE7",
    },
    statusInactive: {
      backgroundColor: "#FFE4E6",
    },
    statusOnLeave: {
      backgroundColor: "#FEF3C7",
    },
    statusPillText: {
      fontSize: 12,
      fontWeight: "600",
      color: palette.textPrimary,
    },
  });
