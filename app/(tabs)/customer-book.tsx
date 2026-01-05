import AnimatedHeader from "@/components/AnimatedHeader";
import PageTitle from "@/components/PageTitle";
import SearchField from "@/components/SearchField";
import { Colors } from "@/constants/theme";
import { useLineOfBusiness } from "@/contexts/LineOfBusinessContext";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useGetSetupBookBySearchIdQuery } from "@/store/services/setupBookApi";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
};

export default function CustomerBookScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = useMemo(() => createStyles(palette), [palette]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [numberOfItemsPerPageList] = useState([5, 10, 15, 40]);
  const [itemsPerPage, onItemsPerPageChange] = useState(
    numberOfItemsPerPageList[0]
  );
  const { canAccess } = usePrivilege();
  const canAccessModule = canAccess("customerBook");
  const canView = canAccess("customerBook", "view");
  const canCreate = canAccess("customerBook", "create");
  const { lineOfBusinessData } = useLineOfBusiness();
  const lobId =
    lineOfBusinessData?.lineOfBusiness?._id ||
    lineOfBusinessData?.lineOfBusiness?.id;
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  // Fetch customer by SearchId
  const {
    data: searchResult,
    isLoading,
    isError,
    error,
  } = useGetSetupBookBySearchIdQuery(
    { lineOfBusinessId: lobId || "", searchId: searchQuery },
    { skip: !searchQuery || !lobId }
  );

  console.log("searchResult", searchResult);

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
          return {
            id: (record.id as string) || (record._id as string),
            firstName: (record.firstName as string) || "",
            lastName: (record.lastName as string) || "",
            email: (record.email as string) || "",
            phone: (record.phone as string) || "",
            // Optionally include any additional properties here if needed
            ...Object.fromEntries(
              Object.entries(record).filter(
                ([key]) =>
                  ![
                    "id",
                    "_id",
                    "firstName",
                    "lastName",
                    "email",
                    "phone",
                  ].includes(key)
              )
            ),
          };
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

  const filteredCustomers = customers;

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const filteredData = customers;

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, filteredData.length);
  const paginated = filteredData.slice(from, to);
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

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
          <SearchField
            value={searchTerm}
            onChangeText={setSearchTerm}
            onSearch={() => handleSearch(searchTerm)}
            placeholder="Search"
            autoCorrect={false}
          />
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.importButton}
            activeOpacity={0.8}
            onPress={() => router.push("/modal/add-customer")}
          >
            <Text style={styles.importButtonText}>Add Customer</Text>
          </TouchableOpacity>
        </View>

        {/* Sticky Column Layout */}
        <View style={{ flexDirection: "row" }}>
          {/* Sticky First Name Column */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Searching customers...</Text>
            </View>
          )}
          <DataTable style={[styles.table, { width: 110 }]}>
            <DataTable.Header style={{ backgroundColor: palette.lightGray }}>
              <DataTable.Title textStyle={styles.columnLabel}>
                Actions
              </DataTable.Title>
            </DataTable.Header>
            {paginated.map((customer) => (
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
                    onPress={() => router.push("/modal/customer-details")}
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

          {/* Scrollable Remaining Columns */}
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <DataTable style={[styles.table, { minWidth: 600 }]}>
              <DataTable.Header>
                <DataTable.Title
                  textStyle={styles.columnLabel}
                  style={styles.nameColumn}
                >
                  First Name
                </DataTable.Title>
                <DataTable.Title
                  textStyle={styles.columnLabel}
                  style={styles.nameColumn}
                >
                  Last Name
                </DataTable.Title>
                <DataTable.Title
                  textStyle={styles.columnLabel}
                  style={styles.emailColumn}
                >
                  Email
                </DataTable.Title>
                <DataTable.Title
                  textStyle={styles.columnLabel}
                  style={styles.phoneColumn}
                >
                  Phone
                </DataTable.Title>
              </DataTable.Header>
              {paginated.map((customer) => (
                <DataTable.Row
                  key={customer.id}
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: palette.mediumGray,
                  }}
                >
                  <DataTable.Cell
                    textStyle={styles.rowText}
                    style={styles.nameColumn}
                  >
                    {customer.firstName}
                  </DataTable.Cell>
                  <DataTable.Cell
                    textStyle={styles.rowText}
                    style={styles.nameColumn}
                  >
                    {customer.lastName}
                  </DataTable.Cell>
                  <DataTable.Cell
                    textStyle={styles.rowText}
                    style={styles.emailColumn}
                  >
                    {customer.email}
                  </DataTable.Cell>
                  <DataTable.Cell
                    textStyle={styles.rowText}
                    style={styles.phoneColumn}
                  >
                    {customer.phone}
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </ScrollView>
        </View>

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

      <AnimatedHeader title="Customer Book" scrollY={scrollY} />
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
    loadingContainer: {
      paddingVertical: 20,
      alignItems: "center",
    },
    loadingText: {
      fontSize: 14,
      color: palette.textSecondary,
    },
  });
