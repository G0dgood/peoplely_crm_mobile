import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { DataTable } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  getAllDispositions,
  syncPendingDispositions,
} from "@/utils/dispositionStorage";
import NetInfo from "@react-native-community/netinfo";

import PageTitle from "@/components/PageTitle";
import {
  CUSTOMER_DETAILS,
  createDetailStyles,
  createModalStyles,
} from "./shared";

export default function CustomerDetailsModal() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = useMemo(() => createModalStyles(palette), [palette]);
  const detailStyles = useMemo(() => createDetailStyles(palette), [palette]);

  const [page, setPage] = useState(0);
  const [numberOfItemsPerPageList] = useState([5, 10, 15, 40]);
  const [itemsPerPage, onItemsPerPageChange] = useState(
    numberOfItemsPerPageList[0]
  );
  const [dispositionHistory, setDispositionHistory] = useState<any[]>([]);

  // Load disposition history from storage
  const loadHistory = useCallback(async () => {
    try {
      const allDispositions = await getAllDispositions();
      // Transform to match the history format
      const history = allDispositions.map((disp) => ({
        date: disp.date,
        time: disp.time,
        agent: disp.agentName,
        duration: "N/A",
        synced: disp.synced,
        id: disp.id,
      }));
      setDispositionHistory(history);
    } catch (error) {
      console.error("Error loading disposition history:", error);
      setDispositionHistory([]);
    }
  }, []);

  // Reload when modal comes into focus
  useFocusEffect(
    useCallback(() => {
      loadHistory();
      // Try to sync pending dispositions
      syncPendingDispositions().then((result) => {
        if (result.synced > 0) {
          loadHistory(); // Reload after sync
        }
      });
    }, [loadHistory])
  );

  useEffect(() => {
    loadHistory();
    // Try to sync pending dispositions
    syncPendingDispositions().then((result) => {
      if (result.synced > 0) {
        loadHistory(); // Reload after sync
      }
    });

    // Monitor network and sync when online
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        syncPendingDispositions().then((result) => {
          if (result.synced > 0) {
            loadHistory(); // Reload after sync
          }
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [loadHistory]);

  // Combine static history with stored dispositions
  // Add IDs to static entries for proper key handling
  const staticHistory = useMemo(
    () =>
      CUSTOMER_DETAILS.history.map((entry, index) => ({
        ...entry,
        id: `static-${index}`,
        synced: true,
      })),
    []
  );

  // Combine and sort by date (newest first)
  const allHistory = useMemo(() => {
    const combined = [...staticHistory, ...dispositionHistory];
    console.log(
      "Combined history count:",
      combined.length,
      "Static:",
      staticHistory.length,
      "Stored:",
      dispositionHistory.length
    );
    return combined.sort((a, b) => {
      // Parse dates for comparison (simple string comparison for now)
      // In a real app, you'd want proper date parsing
      return b.date.localeCompare(a.date);
    });
  }, [staticHistory, dispositionHistory]);
  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, allHistory.length);
  const paginated = allHistory.slice(from, to);
  const totalPages = Math.max(1, Math.ceil(allHistory.length / itemsPerPage));

  useEffect(() => {
    setPage(0);
  }, [itemsPerPage]);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: "rgba(0,0,0,0.4)" }]}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={[styles.container, { backgroundColor: palette.accentWhite }]}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={18} color={palette.textPrimary} />
          </TouchableOpacity>
          <View style={styles.header}>
            <PageTitle title={"Customer Details"} />
            {/* <Text style={styles.title}></Text> */}
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.headerAction}
                activeOpacity={0.7}
                onPress={() => router.push("/modal/sms")}
              >
                <Ionicons
                  name="chatbubble-outline"
                  size={16}
                  color={palette.interactivePrimary}
                />
                <Text style={styles.headerActionText}>SMS</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerActionPrimary}
                activeOpacity={0.7}
                onPress={() => router.push("/modal/disposition")}
              >
                <Ionicons
                  name="document-text-outline"
                  size={16}
                  color={palette.textInverse}
                />
                <Text style={styles.headerActionPrimaryText}>
                  Fill Disposition
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.detailsContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.detailGrid}>
                <DetailItem
                  label="First Name"
                  value={CUSTOMER_DETAILS.firstName}
                  styles={detailStyles}
                />
                <DetailItem
                  label="Last Name"
                  value={CUSTOMER_DETAILS.lastName}
                  styles={detailStyles}
                />
                <DetailItem
                  label="Middle Name"
                  value={CUSTOMER_DETAILS.middleName}
                  styles={detailStyles}
                />
                <DetailItem
                  label="Email"
                  value={CUSTOMER_DETAILS.email}
                  styles={detailStyles}
                />
                <DetailItem
                  label="Phone"
                  value={CUSTOMER_DETAILS.phone}
                  styles={detailStyles}
                />
                <DetailItem
                  label="Address"
                  value={CUSTOMER_DETAILS.address}
                  styles={detailStyles}
                />
              </View>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Disposition History</Text>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.link}>View All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <DataTable style={[styles.historyTable, { minWidth: 600 }]}>
                  <DataTable.Header>
                    <DataTable.Title
                      textStyle={styles.historyHeader}
                      style={styles.dateColumn}
                    >
                      Date
                    </DataTable.Title>
                    <DataTable.Title
                      textStyle={styles.historyHeader}
                      style={styles.timeColumn}
                    >
                      Time
                    </DataTable.Title>
                    <DataTable.Title
                      textStyle={styles.historyHeader}
                      style={styles.agentColumn}
                    >
                      Agent
                    </DataTable.Title>
                    <DataTable.Title
                      textStyle={styles.historyHeader}
                      style={styles.durationColumn}
                    >
                      Time Spent
                    </DataTable.Title>
                    <DataTable.Title
                      textStyle={styles.historyHeader}
                      style={styles.statusColumn}
                    >
                      Status
                    </DataTable.Title>
                    <DataTable.Title
                      textStyle={styles.historyHeader}
                      style={styles.actionColumn}
                    >
                      Action
                    </DataTable.Title>
                  </DataTable.Header>
                  {paginated.map((entry, index) => {
                    const isSynced =
                      entry.synced !== undefined ? entry.synced : true;
                    return (
                      <DataTable.Row
                        key={entry.id || `entry-${index}`}
                        style={{
                          borderBottomWidth: 1,
                          borderBottomColor: palette.mediumGray,
                        }}
                      >
                        <DataTable.Cell
                          textStyle={styles.historyCell}
                          style={styles.dateColumn}
                        >
                          {entry.date}
                        </DataTable.Cell>
                        <DataTable.Cell
                          textStyle={styles.historyCell}
                          style={styles.timeColumn}
                        >
                          {entry.time}
                        </DataTable.Cell>
                        <DataTable.Cell
                          textStyle={styles.historyCell}
                          style={styles.agentColumn}
                        >
                          {entry.agent}
                        </DataTable.Cell>
                        <DataTable.Cell
                          textStyle={styles.historyCell}
                          style={styles.durationColumn}
                        >
                          {entry.duration}
                        </DataTable.Cell>
                        <DataTable.Cell style={styles.statusColumn}>
                          {!isSynced && (
                            <View
                              style={[
                                styles.syncBadge,
                                { backgroundColor: palette.statusWarning },
                              ]}
                            >
                              <Ionicons
                                name="cloud-offline-outline"
                                size={12}
                                color={palette.textInverse}
                              />
                              <Text style={styles.syncBadgeText}>Pending</Text>
                            </View>
                          )}
                          {isSynced && (
                            <View
                              style={[
                                styles.syncBadge,
                                { backgroundColor: palette.statusSuccess },
                              ]}
                            >
                              <Ionicons
                                name="checkmark-circle"
                                size={12}
                                color={palette.textInverse}
                              />
                              <Text style={styles.syncBadgeText}>Synced</Text>
                            </View>
                          )}
                        </DataTable.Cell>
                        <DataTable.Cell style={styles.actionColumn}>
                          <TouchableOpacity
                            onPress={() =>
                              router.push("/modal/disposition-history-details")
                            }
                            activeOpacity={0.7}
                          >
                            <Text style={styles.historyLink}>View Details</Text>
                          </TouchableOpacity>
                        </DataTable.Cell>
                      </DataTable.Row>
                    );
                  })}
                </DataTable>
              </ScrollView>
              {/* <DataTable.Pagination
                page={page}
                numberOfPages={totalPages}
                onPageChange={(page) => setPage(page)}
                label={`${from + 1}-${to} of ${allHistory.length}`}
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
              /> */}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type DetailItemProps = {
  label: string;
  value: string;
  styles: ReturnType<typeof createDetailStyles>;
};

const DetailItem: React.FC<DetailItemProps> = ({ label, value, styles }) => (
  <View style={styles.item}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);
