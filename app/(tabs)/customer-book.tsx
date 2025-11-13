import PageTitle from "@/components/PageTitle";
import SearchField from "@/components/SearchField";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
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
];

export default function CustomerBookScreen() {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];
	const styles = useMemo(() => createStyles(palette), [palette]);

	const [query, setQuery] = useState("");
	const [page, setPage] = useState(0);
	const itemsPerPage = 10;

	const filteredData = CUSTOMERS.filter((customer) => {
		const lowered = query.toLowerCase();
		return (
			customer.firstName.toLowerCase().includes(lowered) ||
			customer.lastName.toLowerCase().includes(lowered) ||
			customer.email.toLowerCase().includes(lowered)
		);
	});

	const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
	const paginated = filteredData.slice(
		page * itemsPerPage,
		page * itemsPerPage + itemsPerPage,
	);
	const from = page * itemsPerPage;
	const to = Math.min((page + 1) * itemsPerPage, filteredData.length);

	useEffect(() => {
		setPage(0);
	}, [query]);

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.headerRow}>
					<PageTitle title="Customer Book" />
					<View style={styles.headerActions}>
						<TouchableOpacity
							style={styles.addButton}
							activeOpacity={0.8}
							onPress={() => router.push("/modal/add-customer")}
						>
							<Text style={styles.addButtonText}>Add Customer</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.importButton} activeOpacity={0.8}>
							<Text style={styles.importButtonText}>Import</Text>
							<Ionicons name="open-outline" size={16} color={palette.textInverse} />
						</TouchableOpacity>
					</View>
				</View>

				<SearchField
					value={query}
					onChangeText={setQuery}
					placeholder="Search"
					autoCorrect={false}
				/>

				{/* <DataTable style={styles.table}>
     <DataTable.Header>
      <DataTable.Title textStyle={styles.columnLabel} style={styles.nameColumn}>
       First Name
      </DataTable.Title>
      <DataTable.Title textStyle={styles.columnLabel} style={styles.nameColumn}>
       Last Name
      </DataTable.Title>
      <DataTable.Title textStyle={styles.columnLabel} style={styles.emailColumn}>
       Email
      </DataTable.Title>
      <DataTable.Title textStyle={styles.columnLabel} style={styles.phoneColumn}>
       Phone
      </DataTable.Title>
      <DataTable.Title numeric textStyle={styles.columnLabel} style={styles.actionsColumn}>
       Actions
      </DataTable.Title>
     </DataTable.Header>

     {paginated.map((customer) => (
      <DataTable.Row key={customer.id}>
       <DataTable.Cell textStyle={styles.rowText}>
        {customer.firstName}
       </DataTable.Cell>
       <DataTable.Cell textStyle={styles.rowText}>
        {customer.lastName}
       </DataTable.Cell>
       <DataTable.Cell textStyle={styles.rowText}>
        {customer.email}
       </DataTable.Cell>
       <DataTable.Cell textStyle={styles.rowText}>
        {customer.phone}
       </DataTable.Cell>
       <DataTable.Cell numeric>
        <TouchableOpacity style={styles.actionButton}>
         <Ionicons name="arrow-forward" size={18} color={palette.textPrimary} />
        </TouchableOpacity>
       </DataTable.Cell>
      </DataTable.Row>
     ))}

     <DataTable.Pagination
      page={page}
      numberOfPages={Math.max(1, Math.ceil(filteredData.length / itemsPerPage))}
      onPageChange={setPage}
      label={`${page * itemsPerPage + 1}-${Math.min(
       (page + 1) * itemsPerPage,
       filteredData.length,
      )} of ${filteredData.length}`}
      numberOfItemsPerPage={itemsPerPage}
      showFastPaginationControls
     />
    </DataTable> */}
				<DataTable style={styles.table}>
					<DataTable.Header>
						<DataTable.Title textStyle={styles.columnLabel} style={styles.nameColumn}>
							First Name
						</DataTable.Title>
						<DataTable.Title textStyle={styles.columnLabel} style={styles.nameColumn}>
							Last Name
						</DataTable.Title>
						<DataTable.Title textStyle={styles.columnLabel} style={styles.emailColumn}>
							Email
						</DataTable.Title>
						<DataTable.Title textStyle={styles.columnLabel} style={styles.phoneColumn}>
							Phone
						</DataTable.Title>
						<DataTable.Title numeric textStyle={styles.columnLabel} style={styles.actionsColumn}>
							Actions
						</DataTable.Title>
					</DataTable.Header>

					{paginated.map((customer) => (
						<DataTable.Row key={customer.id}>
							<DataTable.Cell textStyle={styles.rowText}>{customer.firstName}</DataTable.Cell>
							<DataTable.Cell textStyle={styles.rowText}>{customer.lastName}</DataTable.Cell>
							<DataTable.Cell textStyle={styles.rowText}>{customer.email}</DataTable.Cell>
							<DataTable.Cell textStyle={styles.rowText}>{customer.phone}</DataTable.Cell>
							<DataTable.Cell numeric>
								<TouchableOpacity
									style={styles.actionButton}
									activeOpacity={0.8}
									onPress={() => router.push("/modal/customer-details")}
								>
									<Ionicons name="arrow-forward" size={18} color={palette.textPrimary} />
								</TouchableOpacity>
							</DataTable.Cell>
						</DataTable.Row>
					))}

					<DataTable.Pagination
						page={page}
						numberOfPages={totalPages}
						onPageChange={setPage}
						label={`${from + 1}-${to} of ${filteredData.length}`}
						numberOfItemsPerPage={itemsPerPage}
						showFastPaginationControls
					/>
				</DataTable>
			</ScrollView>
		</SafeAreaView>
	);
}

const createStyles = (palette: (typeof Colors)["light"]) =>
	StyleSheet.create({
		safeArea: {
			flex: 1,
		},
		content: {
			paddingHorizontal: 20,
			paddingBottom: 32,
			gap: 20,
		},
		headerRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			flexWrap: "wrap",
			gap: 12,
		},
		title: {
			fontSize: 28,
			fontWeight: "700",
			color: palette.textPrimary,
		},
		headerActions: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "flex-end",
			width: "100%",
			gap: 12,
		},
		addButton: {
			paddingHorizontal: 16,
			paddingVertical: 12,
			backgroundColor: palette.offWhite2,
		},
		addButtonText: {
			color: palette.primaryLighter,
			fontWeight: "600",
		},
		importButton: {
			flexDirection: "row",
			alignItems: "center",
			gap: 6,
			paddingHorizontal: 18,
			paddingVertical: 12,
			backgroundColor: palette.primary,
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
		},
		columnLabel: {
			fontSize: 12,
			fontWeight: "700",
			textTransform: "uppercase",
			color: palette.textSecondary,
			letterSpacing: 0.5,
		},
		rowText: {
			fontSize: 14,
			color: palette.textPrimary,
		},
		nameColumn: {
			flex: 1.3,
		},
		emailColumn: {
			flex: 2,
		},
		phoneColumn: {
			flex: 1,
		},
		actionsColumn: {
			justifyContent: "flex-end",
			flex: 0.7,
		},
		actionButton: {
			width: 34,
			height: 34,
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: palette.offWhite2,
		},
	});

