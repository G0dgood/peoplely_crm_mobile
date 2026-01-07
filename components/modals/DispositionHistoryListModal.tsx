import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useGetDispositionsByCustomerQuery } from "@/store/services/dispositionApi";
import {
  DispositionData,
  getOfflineDispositions,
  syncPendingDispositions,
} from "@/utils/dispositionStorage";

import { createModalStyles } from "@/app/modal/shared";

type DispositionHistoryItem = {
  id: string;
  date: string;
  time: string;
  agent: string;
  isOffline: boolean;
  dispositionData: any;
  timestamp: number;
  offlineStatus?: any;
  synced?: boolean;
  syncedAt?: string;
};

type DispositionHistoryListModalProps = {
  visible: boolean;
  onClose: () => void;
  customer: any;
};

const createStyles = (palette: typeof Colors.light) =>
  StyleSheet.create({
    ...createModalStyles(palette),
    listHeader: {
      fontSize: 16,
      fontWeight: "600",
      color: palette.textPrimary,
      marginBottom: 16,
    },
    card: {
      backgroundColor: palette.accentWhite,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: palette.mediumGray,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    customerName: {
      fontSize: 14,
      color: palette.textSecondary,
      fontWeight: "400",
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      alignSelf: "flex-start",
    },
    statusText: {
      fontSize: 12,
      fontWeight: "500",
      marginLeft: 4,
    },
    gridContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    gridItem: {
      width: "50%",
      marginBottom: 16,
      paddingRight: 8,
    },
    fullWidthItem: {
      width: "100%",
      marginBottom: 16,
    },
    fieldLabel: {
      fontSize: 12,
      color: palette.textSecondary,
      marginBottom: 4,
    },
    fieldValue: {
      fontSize: 14,
      color: palette.textPrimary,
      fontWeight: "400",
    },
    footer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: palette.mediumGray,
      alignItems: "flex-end",
    },
    closeButtonFooter: {
      backgroundColor: palette.interactivePrimary,
      paddingHorizontal: 24,
      paddingVertical: 10,
    },
    closeButtonText: {
      color: palette.textInverse,
      fontSize: 14,
      fontWeight: "600",
    },
  });

export default function DispositionHistoryListModal({ visible, onClose, customer }: DispositionHistoryListModalProps) {
  const { user } = useAuth();
  const selectedLineOfBusinessId = user?.lineOfBusinessId;

  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = useMemo(() => createStyles(palette), [palette]);

  const [offlineDispositions, setOfflineDispositions] = useState<DispositionData[]>([]);

  // API Query
  const { data: apiData, isLoading } = useGetDispositionsByCustomerQuery(
    {
      lineOfBusinessId: selectedLineOfBusinessId || "",
      customerId: customer?.id || "",
      page: 1,
      limit: 50,
    },
    {
      skip: !customer?.id || !selectedLineOfBusinessId,
    }
  );

  const loadOfflineHistory = useCallback(async () => {
    if (customer?.id) {
      const allOffline = await getOfflineDispositions();
      const customerOffline = allOffline.filter(
        (d) => d.customerId === customer.id
      );
      setOfflineDispositions(customerOffline);
    }
  }, [customer?.id]);

  useFocusEffect(
    useCallback(() => {
      if (visible) {
        loadOfflineHistory();
        syncPendingDispositions().then((result) => {
          if (result.synced > 0) {
            loadOfflineHistory();
          }
        });
      }
    }, [visible, loadOfflineHistory])
  );

  const combinedDispositions: DispositionHistoryItem[] = useMemo(() => {
    const syncedList = apiData
      ? Array.isArray(apiData)
        ? apiData
        : apiData.data || []
      : [];

    const mappedSynced = syncedList.map((item: any) => {
      const dateSource = item.timestamp || item.createdAt || item.syncedAt || "";
      return {
        id: item._id || item.id || "",
        date: new Date(dateSource).toLocaleDateString(),
        time: new Date(dateSource).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        agent: (typeof item.agent === "object" ? item.agent?.name : item.agent) || "Unknown Agent",
        isOffline: false,
        dispositionData: item.fillDisposition || item.dispositionData || [],
        timestamp: new Date(dateSource).getTime(),
        synced: true,
        syncedAt: item.syncedAt ? new Date(item.syncedAt).toLocaleString() : undefined
      };
    });

    const mappedOffline = offlineDispositions.map(
      (offline): DispositionHistoryItem => {
        return {
          id: offline.id,
          date: new Date(offline.createdAt).toLocaleDateString(),
          time: new Date(offline.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          agent: offline.agentName || "Offline Entry",
          isOffline: true,
          offlineStatus: "pending",
          dispositionData: offline,
          timestamp: new Date(offline.createdAt).getTime(),
          synced: false,
        };
      }
    );

    return [...mappedSynced, ...mappedOffline].sort(
      (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
    );
  }, [apiData, offlineDispositions]);

  const getFields = (item: DispositionHistoryItem) => {
    let fields: { label: string; value: string }[] = [];

    // Extract dynamic fields
    if (Array.isArray(item.dispositionData)) {
      fields = item.dispositionData.map((f: any) => ({
        label: f.fieldName,
        value: String(f.fieldValue || ""),
      }));
    } else if (typeof item.dispositionData === "object" && item.dispositionData !== null) {
      fields = Object.entries(item.dispositionData)
        .filter(
          ([key]) =>
            ![
              "id",
              "customerId",
              "agentId",
              "agentName",
              "date",
              "time",
              "synced",
              "createdAt",
              "dateContacted",
              "fillDisposition",
              "dispositionData"
            ].includes(key)
        )
        .map(([key, value]) => ({
          label: key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase()),
          value: String(value || "-"),
        }));
    }

    // Add Metadata fields
    fields.push({ label: "Date", value: item.date });
    fields.push({ label: "Time", value: item.time });
    fields.push({ label: "Agent", value: item.agent });

    if (item.synced && item.syncedAt) {
      fields.push({ label: "Synced", value: item.syncedAt });
    } else if (!item.synced) {
      // Optionally show "Synced: Pending" or just skip
      // fields.push({ label: "Synced", value: "Pending" });
    }

    return fields;
  };

  const renderItem = ({ item }: { item: DispositionHistoryItem }) => {
    const fields = getFields(item);
    const customerName = `${customer.firstName || ""} ${customer.lastName || ""}`.trim();

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: item.synced
                  ? "rgba(34, 197, 94, 0.15)" // Light green bg
                  : "rgba(234, 179, 8, 0.15)", // Light yellow bg
              },
            ]}
          >
            <Ionicons
              name={item.synced ? "checkmark" : "cloud-offline-outline"}
              size={14}
              color={item.synced ? "#16A34A" : "#CA8A04"} // Green or Yellow text
            />
            <Text
              style={[
                styles.statusText,
                { color: item.synced ? "#16A34A" : "#CA8A04" },
              ]}
            >
              {item.synced ? "Synced" : "Pending"}
            </Text>
          </View>
          <Text style={styles.customerName}>{customerName}</Text>
        </View>

        <View style={styles.gridContainer}>
          {fields.map((field, index) => {
            return (
              <View key={index} style={styles.gridItem}>
                <Text style={styles.fieldLabel}>{field.label}:</Text>
                <Text style={styles.fieldValue}>{field.value}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: "rgba(0, 0, 0, 0.5)", padding: 0 }]}
        edges={["top", "left", "right", "bottom"]}
      >
        <TouchableOpacity
          style={{ flex: 1, width: "100%", alignItems: "center", justifyContent: "center", padding: 20 }}
          activeOpacity={1}
          onPress={onClose}
        >
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={{ width: "100%", alignItems: "center" }}
            >
              <View
                style={[styles.container, { backgroundColor: palette.accentWhite }]}
              >
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.title}>Disposition History</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={24} color={palette.textPrimary} />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={combinedDispositions}
                  renderItem={renderItem}
                  keyExtractor={(item, index) => item.id || `index-${index}`}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  ListHeaderComponent={
                    <Text style={styles.listHeader}>
                      History ({combinedDispositions.length})
                    </Text>
                  }
                  ListEmptyComponent={
                    <View style={{ padding: 20, alignItems: "center" }}>
                      <Text style={{ color: palette.textSecondary }}>
                        {!customer?.id
                          ? "Error: Customer data missing"
                          : isLoading
                            ? "Loading..."
                            : "No history found"}
                      </Text>
                    </View>
                  }
                  showsVerticalScrollIndicator={false}
                  style={{ width: "100%", flex: 1 }}
                />

                <View style={styles.footer}>
                  <TouchableOpacity
                    style={styles.closeButtonFooter}
                    activeOpacity={0.8}
                    onPress={onClose}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
}
