import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
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
  DispositionData,
  getOfflineDispositions,
  syncPendingDispositions,
} from "@/utils/dispositionStorage";

import {
  createDetailStyles,
  createModalStyles
} from "@/app/modal/shared";
import { DetailItem } from "@/components/DetailItem";
import PageTitle from "@/components/PageTitle";
import { useAuth } from "@/contexts/AuthContext";
import { useGetDispositionsByCustomerQuery } from "@/store/services/dispositionApi";
import DispositionHistoryListModal from "./DispositionHistoryListModal";
import DispositionModal from "./DispositionModal";
import SmsModal from "./SmsModal";

type CustomerDetailsModalProps = {
  visible: boolean;
  onClose: () => void;
  customer: any;
};

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
  duration?: string;
};

export default function CustomerDetailsModal({ visible, onClose, customer }: CustomerDetailsModalProps) {

  const { user } = useAuth();
  const selectedLineOfBusinessId = user?.lineOfBusinessId;

  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = useMemo(() => createModalStyles(palette), [palette]);
  const detailStyles = useMemo(() => createDetailStyles(palette), [palette]);

  const [page, setPage] = useState(0);
  const [numberOfItemsPerPageList] = useState([5, 10, 15, 40]);
  const [itemsPerPage, onItemsPerPageChange] = useState(
    numberOfItemsPerPageList[0]
  );

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showDispositionModal, setShowDispositionModal] = useState(false);
  const [showDispositionHistoryDetailsModal, setShowDispositionHistoryDetailsModal] = useState(false);
  const [selectedDisposition, setSelectedDisposition] = useState<any>(null);

  const [offlineDispositions, setOfflineDispositions] = useState<DispositionData[]>([]);

  // API Query
  const { data: apiData, isLoading: isApiLoading } = useGetDispositionsByCustomerQuery(
    {
      lineOfBusinessId: selectedLineOfBusinessId || '',
      customerId: customer?.id || '',
      page: 1,
      limit: 50
    },
    {
      skip: !customer?.id || !selectedLineOfBusinessId
    }
  );

  // Load offline dispositions for this customer
  const loadOfflineHistory = useCallback(async () => {
    if (customer?.id) {
      const allOffline = await getOfflineDispositions();
      const customerOffline = allOffline.filter(d => d.customerId === customer.id);
      setOfflineDispositions(customerOffline);
    }
  }, [customer?.id]);

  useEffect(() => {
    if (visible) {
      loadOfflineHistory();
      // Try to sync pending dispositions
      syncPendingDispositions().then((result) => {
        if (result.synced > 0) {
          loadOfflineHistory(); // Reload after sync
        }
      });
    }
  }, [visible, loadOfflineHistory]);

  // Combine synced and offline dispositions
  const combinedDispositions: DispositionHistoryItem[] = useMemo(() => {
    const syncedList = apiData ? (Array.isArray(apiData) ? apiData : apiData.data || []) : [];
    const mappedSynced = syncedList.map((item: any) => ({
      id: item._id || item.id || '',
      date: new Date(item.timestamp || item.createdAt || item.syncedAt || '').toLocaleDateString(),
      time: new Date(item.timestamp || item.createdAt || item.syncedAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      agent: (typeof item.agent === 'object' ? item.agent?.name : item.agent) || 'Unknown Agent',
      isOffline: false,
      dispositionData: item.fillDisposition || item.dispositionData || [],
      timestamp: new Date(item.timestamp || item.createdAt || item.syncedAt || '').getTime(),
      duration: "N/A",
      synced: true,
    }));

    const mappedOffline = offlineDispositions.map((offline): DispositionHistoryItem => {
      const dateStr = new Date(offline.createdAt).toLocaleDateString();
      const timeStr = new Date(offline.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        id: offline.id,
        date: dateStr,
        time: timeStr,
        agent: 'Offline Entry',
        isOffline: true,
        offlineStatus: 'pending',
        dispositionData: offline, // Pass the whole object as data since it's flat
        timestamp: new Date(offline.createdAt).getTime(),
        duration: "N/A",
        synced: false,
      };
    });

    return [...mappedSynced, ...mappedOffline].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [apiData, offlineDispositions]);

  // Extract dynamic headers from the most recent disposition
  const dynamicHeaders = useMemo(() => {
    if (combinedDispositions.length === 0) return [];

    // Look for the first item with dispositionData
    const firstItem = combinedDispositions.find(item => {
      if (Array.isArray(item.dispositionData) && item.dispositionData.length > 0) return true;
      if (typeof item.dispositionData === 'object' && item.dispositionData !== null) return true;
      return false;
    });

    if (!firstItem) return [];

    if (Array.isArray(firstItem.dispositionData)) {
      return firstItem.dispositionData.map((field: any) => field.fieldName).filter(Boolean);
    } else {
      // For offline flat object
      return Object.keys(firstItem.dispositionData).filter(key =>
        !['id', 'customerId', 'agentId', 'agentName', 'date', 'time', 'synced', 'createdAt', 'dateContacted'].includes(key)
      );
    }
  }, [combinedDispositions]);

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, combinedDispositions.length);
  const paginated = combinedDispositions.slice(from, to);

  useEffect(() => {
    setPage(0);
  }, [itemsPerPage]);

  const handleViewDetails = (dispositionId: string) => {
    const disposition = combinedDispositions.find(item => item.id === dispositionId);
    if (disposition) {
      setSelectedDisposition(disposition);
      setShowDispositionHistoryDetailsModal(true);
    }
  };

  if (!customer) return null;

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
              style={{ width: "100%", alignItems: "center", justifyContent: "center" }}
            >
              <View
                style={[styles.container, { backgroundColor: palette.accentWhite }]}
              >
                <View style={styles.modalHeader}>
                  <PageTitle title="Customer Details" />
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={24} color={palette.textPrimary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.headerButtons}>
                  <TouchableOpacity
                    style={[
                      styles.headerAction,
                      {
                        backgroundColor: palette.burntOrange,
                        borderColor: palette.burntOrange,
                      },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => setShowSmsModal(true)}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={16}
                      color={palette.textInverse}
                    />
                    <Text
                      style={[
                        styles.headerActionText,
                        { color: palette.textInverse },
                      ]}
                    >
                      SMS
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.headerActionPrimary}
                    activeOpacity={0.7}
                    onPress={() => setShowDispositionModal(true)}
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

                <ScrollView
                  contentContainerStyle={styles.detailsContent}
                  showsVerticalScrollIndicator={false}
                  style={{ flex: 1 }}
                >
                  <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    <View style={styles.detailGrid}>
                      <DetailItem
                        label="First Name"
                        value={customer.firstName || "N/A"}
                        styles={detailStyles}
                      />
                      <DetailItem
                        label="Last Name"
                        value={customer.lastName || "N/A"}
                        styles={detailStyles}
                      />
                      <DetailItem
                        label="Middle Name"
                        value={customer.middleName || "N/A"}
                        styles={detailStyles}
                      />
                      <DetailItem
                        label="Email"
                        value={customer.email || "N/A"}
                        styles={detailStyles}
                      />
                      <DetailItem
                        label="Phone"
                        value={customer.phone || "N/A"}
                        styles={detailStyles}
                      />
                      <DetailItem
                        label="Address"
                        value={customer.address || "N/A"}
                        styles={detailStyles}
                      />
                    </View>
                  </View>

                  <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Disposition History</Text>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setShowHistoryModal(true)}
                      >
                        <Text style={styles.link}>View All</Text>
                      </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                      <DataTable style={[styles.historyTable, { minWidth: Math.max(600, (dynamicHeaders.length + 5) * 150) }]}>
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
                          {dynamicHeaders.map((header) => (
                            <DataTable.Title
                              key={header}
                              textStyle={styles.historyHeader}
                              style={{ width: 150, paddingHorizontal: 8 }}
                            >
                              {header}
                            </DataTable.Title>
                          ))}
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

                          // Helper to get dynamic value
                          const getDynamicValue = (header: string) => {
                            if (Array.isArray(entry.dispositionData)) {
                              const field = entry.dispositionData.find((f: any) => f.fieldName === header);
                              return field ? String(field.fieldValue || '') : '-';
                            } else if (typeof entry.dispositionData === 'object' && entry.dispositionData !== null) {
                              return String(entry.dispositionData[header] || '-');
                            }
                            return '-';
                          };

                          return (
                            <DataTable.Row
                              key={entry.id ? `${entry.id}-${index}` : `entry-${from + index}`}
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
                              {dynamicHeaders.map((header) => (
                                <DataTable.Cell
                                  key={`${entry.id}-${header}`}
                                  textStyle={styles.historyCell}
                                  style={{ width: 150, paddingHorizontal: 8 }}
                                >
                                  {getDynamicValue(header)}
                                </DataTable.Cell>
                              ))}
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
                                  onPress={() => handleViewDetails(entry.id)}
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
                  </View>
                </ScrollView>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </SafeAreaView>

      <DispositionHistoryListModal
        visible={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        customer={customer}
      />
      <SmsModal
        visible={showSmsModal}
        onClose={() => setShowSmsModal(false)}
        phone={customer.phone}
      />
      <DispositionModal
        visible={showDispositionModal}
        onClose={() => setShowDispositionModal(false)}
        customerId={customer.id}
        customerName={`${customer.firstName || ''} ${customer.lastName || ''}`.trim()}
      />
    </Modal>
  );
}
