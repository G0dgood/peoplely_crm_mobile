// import AnimatedHeader from "@/components/AnimatedHeader";
// import PageTitle from "@/components/PageTitle";
// import SearchField from "@/components/SearchField";
// import { Colors } from "@/constants/theme";
// import { useColorScheme } from "@/hooks/use-color-scheme";
// import { Ionicons } from "@expo/vector-icons";
// import { router } from "expo-router";
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   Animated,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { DataTable } from "react-native-paper";
// import { SafeAreaView } from "react-native-safe-area-context";

// type Customer = {
//   id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
// };

// const CUSTOMERS: Customer[] = [
//   {
//     id: "1",
//     firstName: "Jane",
//     lastName: "Doe",
//     email: "janedoe@example.com",
//     phone: "08023456789",
//   },
//   {
//     id: "2",
//     firstName: "John",
//     lastName: "Tom",
//     email: "janetom@example.com",
//     phone: "08023456789",
//   },
//   {
//     id: "3",
//     firstName: "Abiola",
//     lastName: "Adeyemi",
//     email: "abiola@example.com",
//     phone: "08051234567",
//   },
//   {
//     id: "4",
//     firstName: "Folake",
//     lastName: "Ogun",
//     email: "folake@example.com",
//     phone: "08081231231",
//   },
//   {
//     id: "5",
//     firstName: "Kunle",
//     lastName: "Adisa",
//     email: "kunlea@example.com",
//     phone: "08123459988",
//   },
//   {
//     id: "6",
//     firstName: "Ngozi",
//     lastName: "Okafor",
//     email: "ngozi@example.com",
//     phone: "08127654321",
//   },
//   {
//     id: "7",
//     firstName: "Sola",
//     lastName: "Balogun",
//     email: "sola@example.com",
//     phone: "07039876543",
//   },
//   {
//     id: "8",
//     firstName: "Mary",
//     lastName: "Ikpe",
//     email: "maryikpe@example.com",
//     phone: "08023450000",
//   },
//   {
//     id: "9",
//     firstName: "Tunde",
//     lastName: "Adewale",
//     email: "maryikpe@example.com",
//     phone: "08023450000",
//   },
//   {
//     id: "10",
//     firstName: "Tunde",
//     lastName: "Adewale",
//     email: "maryikpe@example.com",
//     phone: "08023450000",
//   },
//   {
//     id: "11",
//     firstName: "Tunde",
//     lastName: "Adewale",
//     email: "maryikpe@example.com",
//     phone: "08023450000",
//   },
//   {
//     id: "12",
//     firstName: "Tunde",
//     lastName: "Adewale",
//     email: "maryikpe@example.com",
//     phone: "08023450000",
//   },
//   {
//     id: "13",
//     firstName: "Tunde",
//     lastName: "Adewale",
//     email: "maryikpe@example.com",
//     phone: "08023450000",
//   },
//   {
//     id: "14",
//     firstName: "Tunde",
//     lastName: "Adewale",
//     email: "maryikpe@example.com",
//     phone: "08023450000",
//   },
//   {
//     id: "15",
//     firstName: "Tunde",
//     lastName: "Adewale",
//     email: "maryikpe@example.com",
//     phone: "08023450000",
//   },
// ];

// export default function CustomerBookScreen() {
//   const colorScheme = useColorScheme() ?? "light";
//   const palette = Colors[colorScheme];
//   const styles = useMemo(() => createStyles(palette), [palette]);
//   // 👇 Animated scroll tracking
//   const scrollY = useRef(new Animated.Value(0)).current;
//   const [query, setQuery] = useState("");
//   const [page, setPage] = useState(0);
//   // ✅ dynamic rows-per-page selector (from the second code)
//   const [numberOfItemsPerPageList] = useState([5, 10, 15, 40]);
//   const [itemsPerPage, onItemsPerPageChange] = useState(
//     numberOfItemsPerPageList[0]
//   );

//   const filteredData = CUSTOMERS.filter((customer) => {
//     const lowered = query.toLowerCase();
//     return (
//       customer.firstName.toLowerCase().includes(lowered) ||
//       customer.lastName.toLowerCase().includes(lowered) ||
//       customer.email.toLowerCase().includes(lowered)
//     );
//   });

//   const from = page * itemsPerPage;
//   const to = Math.min((page + 1) * itemsPerPage, filteredData.length);
//   const paginated = filteredData.slice(from, to);
//   const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

//   useEffect(() => {
//     setPage(0);
//   }, [query, itemsPerPage]);

//   console.log("yes");

//   return (
//     <SafeAreaView
//       style={[styles.safeArea, { backgroundColor: palette.background }]}
//     >
//       <Animated.ScrollView
//         style={styles.container}
//         contentContainerStyle={styles.content}
//         showsVerticalScrollIndicator={false}
//         scrollEventThrottle={16}
//         onScroll={Animated.event(
//           [{ nativeEvent: { contentOffset: { y: scrollY } } }],
//           { useNativeDriver: true }
//         )}
//       >
//         <View style={styles.headerRow}>
//           <PageTitle title="Customer Book" />
//           <View style={styles.headerActions}>
//             <TouchableOpacity
//               style={styles.importButton}
//               activeOpacity={0.8}
//               onPress={() => router.push("/modal/add-customer")}
//             >
//               <Text style={styles.importButtonText}>Add Customer</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//         <SearchField
//           value={query}
//           onChangeText={setQuery}
//           placeholder="Search"
//           autoCorrect={false}
//         />
//         <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//           <DataTable style={styles.table}>
//             <DataTable.Header>
//               <DataTable.Title
//                 textStyle={styles.columnLabel}
//                 style={styles.nameColumn}
//               >
//                 First Name
//               </DataTable.Title>
//               <DataTable.Title
//                 textStyle={styles.columnLabel}
//                 style={styles.nameColumn}
//               >
//                 Last Name
//               </DataTable.Title>
//               <DataTable.Title
//                 textStyle={styles.columnLabel}
//                 style={styles.emailColumn}
//               >
//                 Email
//               </DataTable.Title>
//               <DataTable.Title
//                 textStyle={styles.columnLabel}
//                 style={styles.phoneColumn}
//               >
//                 Phone
//               </DataTable.Title>
//               <DataTable.Title
//                 numeric
//                 textStyle={styles.columnLabel}
//                 style={styles.actionsColumn}
//               >
//                 Actions
//               </DataTable.Title>
//             </DataTable.Header>
//             {paginated.map((customer) => (
//               <DataTable.Row key={customer.id} style={{ marginVertical: 1 }}>
//                 <DataTable.Cell
//                   textStyle={styles.rowText}
//                   style={styles.nameColumn}
//                 >
//                   {customer.firstName}
//                 </DataTable.Cell>
//                 <DataTable.Cell
//                   textStyle={styles.rowText}
//                   style={styles.nameColumn}
//                 >
//                   {customer.lastName}
//                 </DataTable.Cell>
//                 <DataTable.Cell
//                   textStyle={styles.rowText}
//                   style={styles.emailColumn}
//                 >
//                   {customer.email}
//                 </DataTable.Cell>
//                 <DataTable.Cell
//                   textStyle={styles.rowText}
//                   style={styles.phoneColumn}
//                 >
//                   {customer.phone}
//                 </DataTable.Cell>
//                 <DataTable.Cell numeric style={styles.actionsColumn}>
//                   <TouchableOpacity
//                     style={styles.actionButton}
//                     activeOpacity={0.8}
//                     onPress={() => router.push("/modal/customer-details")}
//                   >
//                     <Ionicons
//                       name="arrow-forward"
//                       size={18}
//                       color={palette.textPrimary}
//                     />
//                   </TouchableOpacity>
//                 </DataTable.Cell>
//               </DataTable.Row>
//             ))}
//             {/* ✅ Enhanced pagination using dynamic rows per page */}
//           </DataTable>
//         </ScrollView>
//         <DataTable.Pagination
//           page={page}
//           numberOfPages={totalPages}
//           onPageChange={(page) => setPage(page)}
//           label={`${from + 1}-${to} of ${filteredData.length}`}
//           numberOfItemsPerPageList={numberOfItemsPerPageList}
//           numberOfItemsPerPage={itemsPerPage}
//           onItemsPerPageChange={onItemsPerPageChange}
//           showFastPaginationControls
//           selectPageDropdownLabel={"Rows per page"}
//           theme={{
//             roundness: 0, // 🧩 removes border radius
//           }}
//         />
//       </Animated.ScrollView>
//       <AnimatedHeader title="Customer Book" scrollY={scrollY} />
//     </SafeAreaView>
//   );
// }

// const createStyles = (palette: (typeof Colors)["light"]) =>
//   StyleSheet.create({
//     safeArea: {
//       flex: 1,
//     },
//     container: {
//       flex: 1,
//     },
//     content: {
//       paddingHorizontal: 20,
//       paddingBottom: 32,
//       gap: 20,
//     },
//     headerRow: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       alignItems: "center",
//       flexWrap: "wrap",
//       gap: 12,
//     },
//     title: {
//       fontSize: 28,
//       fontWeight: "700",
//       color: palette.textPrimary,
//     },
//     headerActions: {
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "flex-end",
//       width: "100%",
//       gap: 12,
//     },
//     addButton: {
//       paddingHorizontal: 16,
//       paddingVertical: 12,
//       backgroundColor: palette.offWhite2,
//     },
//     addButtonText: {
//       color: palette.primaryLighter,
//       fontWeight: "600",
//     },
//     importButton: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 6,
//       paddingHorizontal: 18,
//       paddingVertical: 12,
//       backgroundColor: palette.primary,
//     },
//     importButtonText: {
//       color: palette.textInverse,
//       fontWeight: "600",
//     },
//     table: {
//       backgroundColor: palette.accentWhite,
//       shadowColor: "#000",
//       shadowOpacity: 0.05,
//       shadowOffset: { width: 0, height: 8 },
//       shadowRadius: 16,
//       elevation: 2,
//       width: 800, // Fixed width for consistent column sizes
//       borderRadius: 0,
//       overflow: "hidden",
//     },
//     rowText: {
//       fontSize: 14,
//       color: palette.textPrimary,
//       paddingVertical: 12, // Increased for better row height
//       paddingHorizontal: 8, // Added for consistent cell padding
//     },
//     columnLabel: {
//       fontSize: 12,
//       fontWeight: "700",
//       textTransform: "uppercase",
//       color: palette.textSecondary,
//       letterSpacing: 0.5,
//       paddingHorizontal: 8, // Consistent padding
//     },
//     nameColumn: {
//       flex: 1, // Equal width for first and last name
//       minWidth: 120, // Minimum width to prevent squeezing
//       paddingHorizontal: 8,
//     },
//     emailColumn: {
//       flex: 2, // Wider for email to accommodate longer text
//       minWidth: 200,
//       paddingHorizontal: 8,
//     },
//     phoneColumn: {
//       flex: 1.2, // Slightly wider than name for phone numbers
//       minWidth: 140,
//       paddingHorizontal: 8,
//     },
//     actionsColumn: {
//       flex: 0.8, // Narrower for action button
//       minWidth: 80,
//       justifyContent: "center", // Center action button
//       paddingHorizontal: 8,
//     },
//     actionButton: {
//       width: 40,
//       height: 40,
//       alignItems: "center",
//       justifyContent: "center",
//       backgroundColor: palette.offWhite2,
//       borderRadius: 20, // Circular button for better aesthetics
//     },
//   });

import AnimatedHeader from "@/components/AnimatedHeader";
import PageTitle from "@/components/PageTitle";
import SearchField from "@/components/SearchField";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
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

const CUSTOMERS: Customer[] = [
  {
    id: "1",
    firstName: "Jane",
    lastName: "Doe",
    email: "janedoe@example.com",
    phone: "08023456789",
  },
  {
    id: "2",
    firstName: "John",
    lastName: "Tom",
    email: "janetom@example.com",
    phone: "08023456789",
  },
  {
    id: "3",
    firstName: "Abiola",
    lastName: "Adeyemi",
    email: "abiola@example.com",
    phone: "08051234567",
  },
  {
    id: "4",
    firstName: "Folake",
    lastName: "Ogun",
    email: "folake@example.com",
    phone: "08081231231",
  },
  {
    id: "5",
    firstName: "Kunle",
    lastName: "Adisa",
    email: "kunlea@example.com",
    phone: "08123459988",
  },
  {
    id: "6",
    firstName: "Ngozi",
    lastName: "Okafor",
    email: "ngozi@example.com",
    phone: "08127654321",
  },
  {
    id: "7",
    firstName: "Sola",
    lastName: "Balogun",
    email: "sola@example.com",
    phone: "07039876543",
  },
  {
    id: "8",
    firstName: "Mary",
    lastName: "Ikpe",
    email: "maryikpe@example.com",
    phone: "08023450000",
  },
  {
    id: "9",
    firstName: "Tunde",
    lastName: "Adewale",
    email: "maryikpe@example.com",
    phone: "08023450000",
  },
  {
    id: "10",
    firstName: "Tunde",
    lastName: "Adewale",
    email: "maryikpe@example.com",
    phone: "08023450000",
  },
  {
    id: "11",
    firstName: "Tunde",
    lastName: "Adewale",
    email: "maryikpe@example.com",
    phone: "08023450000",
  },
  {
    id: "12",
    firstName: "Tunde",
    lastName: "Adewale",
    email: "maryikpe@example.com",
    phone: "08023450000",
  },
  {
    id: "13",
    firstName: "Tunde",
    lastName: "Adewale",
    email: "maryikpe@example.com",
    phone: "08023450000",
  },
  {
    id: "14",
    firstName: "Tunde",
    lastName: "Adewale",
    email: "maryikpe@example.com",
    phone: "08023450000",
  },
  {
    id: "15",
    firstName: "Tunde",
    lastName: "Adewale",
    email: "maryikpe@example.com",
    phone: "08023450000",
  },
];

export default function CustomerBookScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = useMemo(() => createStyles(palette), [palette]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [numberOfItemsPerPageList] = useState([5, 10, 15, 40]);
  const [itemsPerPage, onItemsPerPageChange] = useState(
    numberOfItemsPerPageList[0]
  );

  const filteredData = CUSTOMERS.filter((customer) => {
    const lowered = query.toLowerCase();
    return (
      customer.firstName.toLowerCase().includes(lowered) ||
      customer.lastName.toLowerCase().includes(lowered) ||
      customer.email.toLowerCase().includes(lowered)
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
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.importButton}
              activeOpacity={0.8}
              onPress={() => router.push("/modal/add-customer")}
            >
              <Text style={styles.importButtonText}>Add Customer</Text>
            </TouchableOpacity>
          </View>
        </View>

        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder="Search"
          autoCorrect={false}
        />

        {/* Sticky Column Layout */}
        <View style={{ flexDirection: "row" }}>
          {/* Sticky First Name Column */}
          <DataTable style={[styles.table, { width: 140 }]}>
            <DataTable.Header>
              <DataTable.Title textStyle={styles.columnLabel}>
                First Name
              </DataTable.Title>
            </DataTable.Header>
            {paginated.map((customer) => (
              <DataTable.Row
                key={customer.id}
                style={{ borderBottomWidth: 1, borderBottomColor: palette.mediumGray }}
              >
                <DataTable.Cell textStyle={styles.rowText}>
                  {customer.firstName}
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
                <DataTable.Title
                  numeric
                  textStyle={styles.columnLabel}
                  style={styles.actionsColumn}
                >
                  Actions
                </DataTable.Title>
              </DataTable.Header>
              {paginated.map((customer) => (
                <DataTable.Row
                  key={customer.id}
                  style={{ borderBottomWidth: 1, borderBottomColor: palette.mediumGray }}
                >
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
              backdrop: colorScheme === "dark" ? palette.background : palette.accentWhite,
              surface: colorScheme === "dark" ? palette.bgPrimary : palette.accentWhite,
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
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 12,
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
    importButtonText: { color: palette.textInverse, fontWeight: "600" },
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
      paddingHorizontal: 8,
    },
    nameColumn: { flex: 1, minWidth: 120, paddingHorizontal: 8 },
    emailColumn: { flex: 2, minWidth: 200, paddingHorizontal: 8 },
    phoneColumn: { flex: 1.2, minWidth: 140, paddingHorizontal: 8 },
    actionsColumn: {
      flex: 0.8,
      minWidth: 80,
      justifyContent: "center",
      paddingHorizontal: 8,
    },
    actionButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: palette.offWhite2,
      borderRadius: 0,
      borderWidth: 1,
      borderColor: palette.mediumGray,
    },
  });
