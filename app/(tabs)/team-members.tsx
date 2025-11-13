import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { DataTable } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import SearchField from "@/components/SearchField";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import PageTitle from "@/components/PageTitle";

type TeamMember = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  supervisor: string;
  team: string;
  status: "Logged In" | "Logged Out";
};

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "agent.10167",
    fullName: "Chinwe Felicia, Ugwumba",
    email: "chinwe@outcess.com",
    phone: "0809",
    role: "Agent",
    supervisor: "Motunrayo Adelanwaa",
    team: "A",
    status: "Logged In",
  },
  {
    id: "agent.10234",
    fullName: "George Atuk Atuk, George",
    email: "george.atck@outcess.com",
    phone: "admin.01",
    role: "Agent",
    supervisor: "Motunrayo Adelanwaa",
    team: "B",
    status: "Logged In",
  },
  {
    id: "10398",
    fullName: "Emmanuel, Omonigho",
    email: "emmanuelo@outcess.com",
    phone: "admin.01",
    role: "Agent",
    supervisor: "Motunrayo Adelanwaa",
    team: "A",
    status: "Logged Out",
  },
  {
    id: "10399",
    fullName: "Ugochukwu, Asuzu",
    email: "ugochuwuasuzu@outcess.com",
    phone: "admin.01",
    role: "Agent",
    supervisor: "Motunrayo Adelanwaa",
    team: "A",
    status: "Logged Out",
  },
  {
    id: "agent.10398",
    fullName: "Emmanuel, Omonigho",
    email: "emmanuelolo@outcess.com",
    phone: "admin.01",
    role: "Agent",
    supervisor: "Motunrayo Adelanwaa",
    team: "B",
    status: "Logged In",
  },
  {
    id: "agent.10541",
    fullName: "Amarachi, Okoro",
    email: "amarachi.okoro@outcess.com",
    phone: "admin.01",
    role: "Agent",
    supervisor: "Motunrayo Adelanwaa",
    team: "C",
    status: "Logged In",
  },
  {
    id: "agent.10542",
    fullName: "Victoria, Falade",
    email: "jadesola.ayeni@outcess.com",
    phone: "admin.01",
    role: "QA",
    supervisor: "Motunrayo Adelanwaa",
    team: "QA",
    status: "Logged In",
  },
  {
    id: "agent.10572",
    fullName: "Mariam Opeyemi, Balogun",
    email: "mariamobalogun@outcess.com",
    phone: "admin.01",
    role: "Agent",
    supervisor: "Motunrayo Adelanwaa",
    team: "A",
    status: "Logged Out",
  },
  {
    id: "agent.10573",
    fullName: "Elizabeth Fikayo, Babalola",
    email: "elizabethbabalola@outcess.com",
    phone: "admin.01",
    role: "Agent",
    supervisor: "Motunrayo Adelanwaa",
    team: "A",
    status: "Logged In",
  },
];

export default function TeamMembersScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = useMemo(() => createStyles(palette), [palette]);

  const [query, setQuery] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState("All Supervisors");
  const [selectedTeam, setSelectedTeam] = useState("All Teams");
  const [page, setPage] = useState(0);
  const itemsPerPage = 8;

  const teams = ["All Teams", "A", "B", "C", "QA"];

  const filteredData = TEAM_MEMBERS.filter((member) => {
    const matchesQuery =
      member.id.toLowerCase().includes(query.toLowerCase()) ||
      member.fullName.toLowerCase().includes(query.toLowerCase());
    const matchesSupervisor =
      selectedSupervisor === "All Supervisors" || member.supervisor === selectedSupervisor;
    const matchesTeam = selectedTeam === "All Teams" || member.team === selectedTeam;
    return matchesQuery && matchesSupervisor && matchesTeam;
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageTitle title="Team Members" />
        <Text style={styles.subtitle}>
          Monitor agent login activity and supervisor assignments.
        </Text>

        <View style={styles.filterRow}>
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder="Search Agent ID"
            autoCorrect={false}
            containerStyle={styles.searchField}
          />

          <View style={styles.filterSelectors}>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() =>
                setSelectedSupervisor((prev) =>
                  prev === "All Supervisors" ? "Motunrayo Adelanwaa" : "All Supervisors"
                )
              }
            >
              <Text style={styles.selectButtonLabel}>{selectedSupervisor}</Text>
              <Ionicons name="chevron-down" size={16} color={palette.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.selectButton}
              onPress={() =>
                setSelectedTeam((prev) => {
                  const currentIndex = teams.indexOf(prev);
                  const nextIndex = (currentIndex + 1) % teams.length;
                  return teams[nextIndex];
                })
              }
            >
              <Text style={styles.selectButtonLabel}>{selectedTeam}</Text>
              <Ionicons name="chevron-down" size={16} color={palette.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tableMeta}>
          <View style={styles.showing}>
            <Text style={styles.metaLabel}>Showing</Text>
            <TouchableOpacity style={styles.pageSizeButton}>
              <Text style={styles.pageSizeValue}>{itemsPerPage}</Text>
              <Ionicons name="chevron-down" size={14} color={palette.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.metaLabel}>
              of {filteredData.length.toString().padStart(2, "0")} Team Members
            </Text>
          </View>
          <Text style={styles.metaLabel}>
            Total of {filteredData.length} Team Members
          </Text>
        </View>

        <DataTable style={styles.table}>
          <DataTable.Header>
            <DataTable.Title textStyle={styles.columnLabel} style={styles.idColumn}>
              Agent ID
            </DataTable.Title>
            <DataTable.Title textStyle={styles.columnLabel} style={styles.nameColumn}>
              Full Name
            </DataTable.Title>
            <DataTable.Title textStyle={styles.columnLabel} style={styles.emailColumn}>
              Email
            </DataTable.Title>
            <DataTable.Title textStyle={styles.columnLabel} style={styles.phoneColumn}>
              Phone No
            </DataTable.Title>
            <DataTable.Title textStyle={styles.columnLabel} style={styles.roleColumn}>
              Role
            </DataTable.Title>
            <DataTable.Title textStyle={styles.columnLabel} style={styles.supervisorColumn}>
              Supervisor
            </DataTable.Title>
            <DataTable.Title textStyle={styles.columnLabel} style={styles.statusColumn}>
              Logged In Status
            </DataTable.Title>
          </DataTable.Header>

          {filteredData
            .slice(page * itemsPerPage, page * itemsPerPage + itemsPerPage)
            .map((member) => (
              <DataTable.Row key={member.id}>
                <DataTable.Cell textStyle={styles.rowText} style={styles.idColumn}>
                  {member.id}
                </DataTable.Cell>
                <DataTable.Cell textStyle={styles.rowText} style={styles.nameColumn}>
                  {member.fullName}
                </DataTable.Cell>
                <DataTable.Cell textStyle={styles.rowText} style={styles.emailColumn}>
                  {member.email}
                </DataTable.Cell>
                <DataTable.Cell textStyle={styles.rowText} style={styles.phoneColumn}>
                  {member.phone}
                </DataTable.Cell>
                <DataTable.Cell textStyle={styles.rowText} style={styles.roleColumn}>
                  {member.role}
                </DataTable.Cell>
                <DataTable.Cell textStyle={styles.rowText} style={styles.supervisorColumn}>
                  {member.supervisor}
                </DataTable.Cell>
                <DataTable.Cell style={styles.statusColumn}>
                  <View
                    style={[
                      styles.statusPill,
                      member.status === "Logged In"
                        ? styles.statusLoggedIn
                        : styles.statusLoggedOut,
                    ]}
                  >
                    <Text style={styles.statusPillText}>{member.status}</Text>
                  </View>
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
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: palette.textPrimary,
    },
    subtitle: {
      fontSize: 14,
      color: palette.textSecondary,
    },
    filterRow: {
      flexDirection: "row",
      gap: 12,
      alignItems: "center",
      flexWrap: "wrap",
    },
    searchField: {
      flex: 1,
      minWidth: 220,
    },
    filterSelectors: {
      flexDirection: "row",
      gap: 12,
    },
    selectButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: palette.accentWhite,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 12,
      elevation: 2,
    },
    selectButtonLabel: {
      color: palette.textPrimary,
      fontWeight: "600",
    },
    tableMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 12,
    },
    showing: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    metaLabel: {
      fontSize: 13,
      color: palette.textSecondary,
    },
    pageSizeButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: palette.accentWhite,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    pageSizeValue: {
      fontWeight: "600",
      color: palette.textPrimary,
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
    idColumn: {
      flex: 1.2,
    },
    nameColumn: {
      flex: 1.8,
    },
    emailColumn: {
      flex: 2,
    },
    phoneColumn: {
      flex: 1,
    },
    roleColumn: {
      flex: 1,
    },
    supervisorColumn: {
      flex: 1.5,
    },
    statusColumn: {
      flex: 1.1,
      justifyContent: "center",
    },
    statusPill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      alignItems: "center",
      justifyContent: "center",
    },
    statusLoggedIn: {
      backgroundColor: "#DCFCE7",
    },
    statusLoggedOut: {
      backgroundColor: "#FFE4E6",
    },
    statusPillText: {
      fontSize: 12,
      fontWeight: "600",
      color: palette.textPrimary,
    },
  });
