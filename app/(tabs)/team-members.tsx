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
import PageTitle from "@/components/PageTitle";
import SearchField from "@/components/SearchField";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

type TeamMember = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  supervisor: string;
  team: string;
  status: "Logged In" | "Logged Out" | "In Meeting" | string;
};

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "agent.10167",
    fullName: "Chinwe Felicia, Ugwumba",
    email: "chinwe@outcess.com",
    phone: "08098765432",
    role: "Agent",
    supervisor: "Motunrayo Adelanwaa",
    team: "A",
    status: "Logged In",
  },
  {
    id: "agent.10234",
    fullName: "George Atuk Atuk, George",
    email: "george.atck@outcess.com",
    phone: "08098765432",
    role: "Agent",
    supervisor: "Motunrayo Adelanwaa",
    team: "B",
    status: "Logged In",
  },
  {
    id: "10398",
    fullName: "Emmanuel, Omonigho",
    email: "emmanuelo@outcess.com",
    phone: "08098765432",
    role: "Agent",
    supervisor: "Motunrayo Adelanwaa",
    team: "A",
    status: "Logged Out",
  },
  {
    id: "10399",
    fullName: "Ugochukwu, Asuzu",
    email: "ugochuwuasuzu@outcess.com",
    phone: "08098765432",
    role: "Agent",
    supervisor: "Motunrayo Adelanwaa",
    team: "A",
    status: "Logged Out",
  },
  {
    id: "agent.10398",
    fullName: "Emmanuel, Omonigho",
    email: "emmanuelolo@outcess.com",
    phone: "08098765432",
    role: "Agent",
    supervisor: "Motunrayo Adelanwaa",
    team: "B",
    status: "Logged In",
  },
  {
    id: "agent.10541",
    fullName: "Amarachi, Okoro",
    email: "amarachi.okoro@outcess.com",
    phone: "08098765432",
    role: "Agent",
    supervisor: "Motunrayo Adelanwaa",
    team: "C",
    status: "Logged In",
  },
  {
    id: "agent.10542",
    fullName: "Victoria, Falade",
    email: "jadesola.ayeni@outcess.com",
    phone: "08098765432",
    role: "QA",
    supervisor: "Motunrayo Adelanwaa",
    team: "QA",
    status: "Logged In",
  },
  {
    id: "agent.10572",
    fullName: "Mariam Opeyemi, Balogun",
    email: "mariamobalogun@outcess.com",
    phone: "08098765432",
    role: "Agent",
    supervisor: "Motunrayo Adelanwaa",
    team: "A",
    status: "Logged Out",
  },
  {
    id: "agent.10573",
    fullName: "Elizabeth Fikayo, Babalola",
    email: "elizabethbabalola@outcess.com",
    phone: "08098765432",
    role: "Agent",
    supervisor: "Motunrayo Adelanwaa",
    team: "A",
    status: "Logged In",
  },
];

export default function TeamMembersScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = useMemo(
    () => createStyles(palette, colorScheme),
    [palette, colorScheme]
  );
  const { user } = useAuth();
  const { socket } = useSocket();

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(TEAM_MEMBERS);
  const [query, setQuery] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] =
    useState("All Supervisors");
  const [selectedTeam, setSelectedTeam] = useState("All Teams");
  const [page, setPage] = useState(0);
  const [numberOfItemsPerPageList] = useState([5, 10, 15, 40]);
  const [itemsPerPage, onItemsPerPageChange] = useState(
    numberOfItemsPerPageList[0]
  );
  const [showSupervisorModal, setShowSupervisorModal] = useState(false);

  //  Animated scroll tracking
  const scrollY = useRef(new Animated.Value(0)).current;

  const teams = ["All Teams", "A", "B", "C", "QA"];

  // Extract all unique supervisors from the data
  const allSupervisors = useMemo(() => {
    const supervisors = new Set(
      teamMembers.map((member) => member.supervisor)
    );
    return ["All Supervisors", ...Array.from(supervisors).sort()];
  }, [teamMembers]);

  const filteredData = teamMembers.filter((member) => {
    const matchesQuery =
      member.id.toLowerCase().includes(query.toLowerCase()) ||
      member.fullName.toLowerCase().includes(query.toLowerCase());
    const matchesSupervisor =
      selectedSupervisor === "All Supervisors" ||
      member.supervisor === selectedSupervisor;
    const matchesTeam =
      selectedTeam === "All Teams" || member.team === selectedTeam;
    return matchesQuery && matchesSupervisor && matchesTeam;
  });

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, filteredData.length);
  const paginated = filteredData.slice(from, to);
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  useEffect(() => {
    setPage(0);
  }, [query, itemsPerPage, selectedSupervisor, selectedTeam]);

  useEffect(() => {
    if (!socket || !user) return;

    // Join room with Supervisor's TeamMember ID
    // Assuming user.id corresponds to the TeamMember ID
    socket.emit("join", user.id);

    const handleStatusUpdate = (data: {
      teamMemberId: string;
      name: string;
      status: string;
      timestamp: string;
    }) => {
      console.log("Team Member Updated:", data);
      setTeamMembers((prevMembers) =>
        prevMembers.map((member) =>
          member.id === data.teamMemberId
            ? { ...member, status: data.status }
            : member
        )
      );
    };

    socket.on("teamMemberStatusUpdate", handleStatusUpdate);

    return () => {
      socket.off("teamMemberStatusUpdate", handleStatusUpdate);
    };
  }, [socket, user]);

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
        <PageTitle title="Team Members" />
        {/* <Text style={styles.subtitle}>
          Monitor agent login activity and supervisor assignments.
        </Text> */}

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
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowSupervisorModal(true);
              }}
            >
              <Text style={styles.selectButtonLabel}>{selectedSupervisor}</Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={palette.textSecondary}
              />
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
              <Ionicons
                name="chevron-down"
                size={16}
                color={palette.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flexDirection: "row" }}>
          {/* Sticky Agent ID Column */}
          <DataTable style={[styles.table, { width: 140 }]}>
            <DataTable.Header style={{ backgroundColor: palette.lightGray }}>
              <DataTable.Title textStyle={styles.columnLabel}>
                Agent ID
              </DataTable.Title>
            </DataTable.Header>

            {paginated.map((member) => (
              <DataTable.Row
                key={member.id}
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: palette.mediumGray,
                  backgroundColor: palette.lightGray,
                }}
              >
                <DataTable.Cell
                  textStyle={styles.rowText}
                  style={styles.idColumn}
                >
                  {member.id}
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>

          {/* Scrollable Remaining Columns */}
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <DataTable style={[styles.table, { minWidth: 860 }]}>
              <DataTable.Header>
                <DataTable.Title
                  textStyle={styles.columnLabel}
                  style={styles.nameColumn}
                >
                  Full Name
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
                  Phone No
                </DataTable.Title>
                <DataTable.Title
                  textStyle={styles.columnLabel}
                  style={styles.roleColumn}
                >
                  Role
                </DataTable.Title>
                <DataTable.Title
                  textStyle={styles.columnLabel}
                  style={styles.supervisorColumn}
                >
                  Supervisor
                </DataTable.Title>
                <DataTable.Title
                  textStyle={styles.columnLabel}
                  style={styles.statusColumn}
                >
                  Logged In Status
                </DataTable.Title>
              </DataTable.Header>

              {paginated.map((member) => (
                <DataTable.Row
                  key={member.id}
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: palette.mediumGray,
                  }}
                >
                  <DataTable.Cell
                    textStyle={styles.rowText}
                    style={styles.nameColumn}
                  >
                    {member.fullName}
                  </DataTable.Cell>
                  <DataTable.Cell
                    textStyle={styles.rowText}
                    style={styles.emailColumn}
                  >
                    {member.email}
                  </DataTable.Cell>
                  <DataTable.Cell
                    textStyle={styles.rowText}
                    style={styles.phoneColumn}
                  >
                    {member.phone}
                  </DataTable.Cell>
                  <DataTable.Cell
                    textStyle={styles.rowText}
                    style={styles.roleColumn}
                  >
                    {member.role}
                  </DataTable.Cell>
                  <DataTable.Cell
                    textStyle={styles.rowText}
                    style={styles.supervisorColumn}
                  >
                    {member.supervisor}
                  </DataTable.Cell>
                  <DataTable.Cell
                    style={[
                      styles.statusColumn,
                      styles.statusPill,
                      member.status === "Logged In"
                        ? styles.statusLoggedIn
                        : member.status === "In Meeting"
                          ? styles.statusInMeeting
                          : styles.statusLoggedOut,
                    ]}
                  >
                    <View>
                      <Text
                        style={[
                          styles.statusPillText,
                          member.status === "Logged In"
                            ? styles.statusPillTextLoggedIn
                            : member.status === "In Meeting"
                              ? styles.statusPillTextInMeeting
                              : styles.statusPillTextLoggedOut,
                        ]}
                      >
                        {member.status}
                      </Text>
                    </View>
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
      <AnimatedHeader title="Team Members" scrollY={scrollY} />

      {/* Supervisor Dropdown Modal */}
      <Modal
        visible={showSupervisorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSupervisorModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSupervisorModal(false)}
        >
          <TouchableOpacity
            style={[
              styles.modalContent,
              { backgroundColor: palette.accentWhite },
            ]}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>
                Select Supervisor
              </Text>
              <TouchableOpacity
                onPress={() => setShowSupervisorModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalList}
              showsVerticalScrollIndicator={false}
            >
              {allSupervisors.map((supervisor) => (
                <TouchableOpacity
                  key={supervisor}
                  style={[
                    styles.modalOption,
                    selectedSupervisor === supervisor && {
                      backgroundColor: palette.offWhite2,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedSupervisor(supervisor);
                    setShowSupervisorModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      {
                        color:
                          selectedSupervisor === supervisor
                            ? palette.interactivePrimary
                            : palette.textPrimary,
                        fontWeight:
                          selectedSupervisor === supervisor ? "600" : "400",
                      },
                    ]}
                  >
                    {supervisor}
                  </Text>
                  {selectedSupervisor === supervisor && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={palette.interactivePrimary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
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
      width: "100%",
      flexDirection: "row",
      justifyContent: "flex-end",
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
      paddingHorizontal: 5,
    },
    rowText: {
      fontSize: 14,
      color: palette.textPrimary,
      paddingVertical: 12,
      paddingHorizontal: 8,
    },
    idColumn: {
      flex: 1.2,
      minWidth: 140,
      paddingHorizontal: 8,
    },
    nameColumn: {
      flex: 1.8,
      minWidth: 180,
      paddingHorizontal: 8,
    },
    emailColumn: {
      flex: 2,
      minWidth: 240,
      paddingHorizontal: 8,
    },
    phoneColumn: {
      flex: 1,
      minWidth: 120,
      paddingHorizontal: 8,
    },
    roleColumn: {
      flex: 1,
      minWidth: 120,
      paddingHorizontal: 8,
    },
    supervisorColumn: {
      flex: 1.5,
      minWidth: 180,
      paddingHorizontal: 8,
    },
    statusColumn: {
      flex: 1.1,
      minWidth: 140,
      justifyContent: "center",
      paddingHorizontal: 8,
    },

    statusPill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      alignItems: "center",
      justifyContent: "center",
      // borderWidth: 1,
    },
    statusLoggedIn: {
      backgroundColor:
        colorScheme === "dark"
          ? "rgba(108, 139, 125, 0.2)"
          : "rgba(108, 139, 125, 0.1)",
      // borderColor: palette.statusSuccess,
    },
    statusLoggedOut: {
      backgroundColor:
        colorScheme === "dark"
          ? "rgba(220, 53, 69, 0.2)"
          : "rgba(220, 53, 69, 0.1)",
      // borderColor: palette.statusError,
    },
    statusInMeeting: {
      backgroundColor:
        colorScheme === "dark"
          ? "rgba(253, 126, 20, 0.2)"
          : "rgba(253, 126, 20, 0.1)",
    },
    statusPillText: {
      fontSize: 12,
      fontWeight: "600",
    },
    statusPillTextLoggedIn: {
      color: palette.statusSuccess,
    },
    statusPillTextLoggedOut: {
      color: palette.statusError,
    },
    statusPillTextInMeeting: {
      color: palette.statusWarning,
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
      maxHeight: "80%",
      borderRadius: 0,
      padding: 24,
      gap: 16,
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
    modalList: {
      maxHeight: 300,
    },
    modalOption: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 4,
      borderBottomWidth: 1,
      borderBottomColor: palette.mediumGray,
    },
    modalOptionText: {
      fontSize: 15,
    },
  });
