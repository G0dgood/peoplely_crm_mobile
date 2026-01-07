import AnimatedHeader from "@/components/AnimatedHeader";
import AddCustomerModal from "@/components/modals/AddCustomerModal";
import CustomerDetailsModal from "@/components/modals/CustomerDetailsModal";
import PageTitle from "@/components/PageTitle";
import SearchField from "@/components/SearchField";
import Skeleton from "@/components/Skeleton";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useGetSetupBookBySearchIdQuery } from "@/store/services/setupBookApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
};

export default function CustomerBookScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = useMemo(() => createStyles(palette), [palette]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { canAccess } = usePrivilege();
  const canAccessModule = canAccess("customerBook");
  const canView = canAccess("customerBook", "view");
  const canCreate = canAccess("customerBook", "create");

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showCustomerDetailsModal, setShowCustomerDetailsModal] = useState(false);

  // Fetch customer by SearchId
  const {
    data: searchResult,
    isLoading,
    isError,
    error,
  } = useGetSetupBookBySearchIdQuery(
    { lineOfBusinessId: user?.lineOfBusinessId || "", searchId: searchQuery },
    { skip: !searchQuery || !user?.lineOfBusinessId }
  );



  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);

  // Update customers list when search result is found
  React.useEffect(() => {
    if (searchResult?.data) {
      const data = searchResult.data as unknown[];
      if (Array.isArray(data) && data.length > 0) {
        // Dynamically extract headers from the first item, excluding internal fields like _id, id, __v
        const firstItem = data[0] as Record<string, unknown>;
        const headers = Object.keys(firstItem).filter(
          (key) =>
            !["_id", "id", "__v", "companyId", "lineOfBusinessId"].includes(
              key
            ) && key.toLowerCase() !== "searchid"
        );
        setTableHeaders(headers);

        const mappedCustomers: Customer[] = data.map((item) => {
          const record = item as Record<string, unknown>;

          // Helper to get value case-insensitively or by specific keys
          const getValue = (keys: string[]) => {
            for (const key of keys) {
              if (record[key] !== undefined && record[key] !== null) {
                return String(record[key]);
              }
            }
            return "";
          };

          // Handle Name splitting if firstName/lastName are missing
          let firstName = getValue(["firstName", "FirstName"]);
          let lastName = getValue(["lastName", "LastName"]);
          const fullName = getValue(["Name", "name", "FullName"]);

          if ((!firstName || !lastName) && fullName) {
            const parts = fullName.split(" ");
            if (!firstName) firstName = parts[0] || "";
            if (!lastName) lastName = parts.slice(1).join(" ") || "";
          }

          return {
            id: (record.id as string) || (record._id as string),
            firstName,
            lastName,
            email: getValue(["email", "Email"]),
            phone: getValue(["phone", "Phone", "phoneNumber", "Mobile"]),
            address: getValue(["address", "Address", "Location"]), // Mapping Location/Address to address
            ...Object.fromEntries(
              Object.entries(record).filter(
                ([key]) =>
                  ![
                    "id",
                    "_id",
                    "__v",
                    // We don't exclude other keys so they appear in the table if they are in headers
                  ].includes(key)
              )
            ),
          } as unknown as Customer;
        });
        setCustomers(mappedCustomers);
      } else {
        setCustomers([]);
      }
    } else if (isError) {
      setCustomers([]);
      if (error && "data" in error) {
        const errorData = (error as { data: { message?: string } }).data;
        if (errorData?.message === "Record not found") {
          console.error(errorData?.message);
        }
      }
    }
  }, [searchResult, isError, error]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  if (!canAccessModule) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: palette.background }]}
      >
        <View style={styles.content}>
          <View style={[styles.restrictedContainer, { borderColor: palette.mediumGray, backgroundColor: palette.accentWhite }]}>
            <Text style={[styles.restrictedTitle, { color: palette.textPrimary }]}>Access Restricted</Text>
            <Text style={[styles.restrictedMessage, { color: palette.textTertiary }]}>
              You do not have access permission to view Customer Book.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
    >
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
        <View style={styles.headerRow}>
          <PageTitle title="Customer Book" />
          {canView && (
            <SearchField
              value={searchTerm}
              onChangeText={setSearchTerm}
              onSearch={() => handleSearch(searchTerm)}
              placeholder="Search"
              autoCorrect={false}
            />
          )}
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.importButton, !canCreate && { opacity: 0.5 }]}
            activeOpacity={0.8}
            onPress={() => canCreate && setShowAddCustomerModal(true)}
            disabled={!canCreate}
          >
            <Text style={styles.importButtonText}>Add Customer</Text>
          </TouchableOpacity>
        </View>

        {/* Sticky Column Layout */}
        <View style={{ flexDirection: "row" }}>
          {/* Sticky Actions Column */}
          <DataTable style={[styles.table, { width: 110 }]}>
            <DataTable.Header style={{ backgroundColor: palette.lightGray }}>
              <DataTable.Title textStyle={styles.columnLabel}>
                Actions
              </DataTable.Title>
            </DataTable.Header>
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                <DataTable.Row
                  key={`sticky-skeleton-${index}`}
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: palette.mediumGray,
                    backgroundColor: palette.lightGray,
                  }}
                >
                  <DataTable.Cell style={styles.actionsColumn}>
                    <Skeleton width={40} height={20} />
                  </DataTable.Cell>
                </DataTable.Row>
              ))
              : customers?.map((customer) => (
                <DataTable.Row
                  key={customer.id}
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: palette.mediumGray,
                    backgroundColor: palette.lightGray,
                  }}
                >
                  <DataTable.Cell numeric style={styles.actionsColumn}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      activeOpacity={0.8}
                      onPress={() => {
                        setSelectedCustomer(customer);
                        setShowCustomerDetailsModal(true);
                      }}
                    >
                      <Ionicons
                        name="arrow-forward"
                        size={18}
                        color={palette.textPrimary}
                      />
                    </TouchableOpacity>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
          </DataTable>

          {/* Scrollable Dynamic Columns */}
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <DataTable
              style={[
                styles.table,
                {
                  minWidth: Math.max(
                    600,
                    isLoading ? 600 : tableHeaders.length * 150
                  ),
                },
              ]}
            >
              <DataTable.Header>
                {isLoading
                  ? Array.from({ length: 4 }).map((_, index) => (
                    <DataTable.Title
                      key={`header-skeleton-${index}`}
                      style={{ width: 150, paddingHorizontal: 8 }}
                    >
                      <Skeleton width={80} height={15} />
                    </DataTable.Title>
                  ))
                  : tableHeaders.map((header) => (
                    <DataTable.Title
                      key={header}
                      textStyle={styles.columnLabel}
                      style={{ width: 150, paddingHorizontal: 8 }}
                    >
                      {header}
                    </DataTable.Title>
                  ))}
              </DataTable.Header>
              {isLoading
                ? Array.from({ length: 5 }).map((_, rIndex) => (
                  <DataTable.Row
                    key={`row-skeleton-${rIndex}`}
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: palette.mediumGray,
                    }}
                  >
                    {Array.from({ length: 4 }).map((_, cIndex) => (
                      <DataTable.Cell
                        key={`cell-skeleton-${rIndex}-${cIndex}`}
                        style={{ width: 150, paddingHorizontal: 8 }}
                      >
                        <Skeleton width={100} height={15} />
                      </DataTable.Cell>
                    ))}
                  </DataTable.Row>
                ))
                : customers?.map((customer) => (
                  <DataTable.Row
                    key={customer.id}
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: palette.mediumGray,
                    }}
                  >
                    {tableHeaders.map((header) => (
                      <DataTable.Cell
                        key={`${customer.id}-${header}`}
                        textStyle={styles.rowText}
                        style={{ width: 150, paddingHorizontal: 8 }}
                      >
                        {String((customer as any)[header] || "")}
                      </DataTable.Cell>
                    ))}
                  </DataTable.Row>
                ))}
            </DataTable>
          </ScrollView>
        </View>


      </Animated.ScrollView>

      <AnimatedHeader title="Customer Book" scrollY={scrollY} />

      <AddCustomerModal
        visible={showAddCustomerModal}
        onClose={() => setShowAddCustomerModal(false)}
      />

      {selectedCustomer && (
        <CustomerDetailsModal
          visible={showCustomerDetailsModal}
          onClose={() => setShowCustomerDetailsModal(false)}
          customer={selectedCustomer}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (palette: (typeof Colors)["light"]) =>
  StyleSheet.create({
    safeArea: { flex: 1 },
    container: { flex: 1 },
    content: { paddingHorizontal: 20, paddingBottom: 32, gap: 20 },
    headerRow: {
      // flexDirection: "row",
      justifyContent: "space-between",
      // alignItems: "center",
      flexWrap: "wrap",
      gap: 20,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      width: "100%",
      gap: 12,
    },
    importButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 18,
      paddingVertical: 12,
      backgroundColor: palette.interactivePrimary,
      borderWidth: 1,
      borderColor: palette.interactivePrimary,
    },
    importButtonText: {
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
      borderRadius: 0,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: palette.mediumGray,
    },
    rowText: {
      fontSize: 14,
      color: palette.textPrimary,
      paddingVertical: 12,
      paddingHorizontal: 8,
    },
    columnLabel: {
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      color: palette.textSecondary,
      letterSpacing: 0.5,
      paddingHorizontal: 5,
    },
    nameColumn: {
      flex: 1,
      minWidth: 120,
      paddingHorizontal: 8,
    },
    emailColumn: {
      flex: 2,
      minWidth: 200,
      paddingHorizontal: 8,
    },
    phoneColumn: {
      flex: 1.2,
      minWidth: 140,
      paddingHorizontal: 8,
    },
    actionsColumn: {
      flex: 0.8,
      minWidth: 80,
      justifyContent: "center",
      paddingHorizontal: 8,
      // backgroundColor: palette.primaryLighter,
    },
    actionButton: {
      width: 70,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      // backgroundColor: palette.offWhite2,
      // borderRadius: 0,
      // borderWidth: 1,
      // borderColor: palette.mediumGray,
    },
    restrictedContainer: {
      padding: 24,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    restrictedTitle: {
      fontSize: 18,
      fontWeight: "600",
    },
    restrictedMessage: {
      fontSize: 14,
      textAlign: "center",
    },
  });
