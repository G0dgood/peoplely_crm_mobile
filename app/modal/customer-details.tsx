import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
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

import { CUSTOMER_DETAILS, createDetailStyles, createModalStyles } from "./shared";

export default function CustomerDetailsModal() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = useMemo(() => createModalStyles(palette), [palette]);
  const detailStyles = useMemo(() => createDetailStyles(palette), [palette]);

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
            <Text style={styles.title}>Customer Details</Text>
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
                <Text style={styles.headerActionPrimaryText}>Fill Disposition</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.detailsContent} showsVerticalScrollIndicator={false}>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.detailGrid}>
                <DetailItem label="First Name" value={CUSTOMER_DETAILS.firstName} styles={detailStyles} />
                <DetailItem label="Last Name" value={CUSTOMER_DETAILS.lastName} styles={detailStyles} />
                <DetailItem label="Middle Name" value={CUSTOMER_DETAILS.middleName} styles={detailStyles} />
                <DetailItem label="Email" value={CUSTOMER_DETAILS.email} styles={detailStyles} />
                <DetailItem label="Phone" value={CUSTOMER_DETAILS.phone} styles={detailStyles} />
                <DetailItem label="Address" value={CUSTOMER_DETAILS.address} styles={detailStyles} />
              </View>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Disposition History</Text>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.link}>View All</Text>
                </TouchableOpacity>
              </View>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title textStyle={styles.historyHeader}>Date</DataTable.Title>
                  <DataTable.Title textStyle={styles.historyHeader}>Time</DataTable.Title>
                  <DataTable.Title textStyle={styles.historyHeader}>Agent</DataTable.Title>
                  <DataTable.Title textStyle={styles.historyHeader}>Time Spent</DataTable.Title>
                  <DataTable.Title textStyle={styles.historyHeader}>Action</DataTable.Title>
                </DataTable.Header>
                {CUSTOMER_DETAILS.history.map((entry, index) => (
                  <DataTable.Row key={`${entry.date}-${index}`}>
                    <DataTable.Cell textStyle={styles.historyCell}>{entry.date}</DataTable.Cell>
                    <DataTable.Cell textStyle={styles.historyCell}>{entry.time}</DataTable.Cell>
                    <DataTable.Cell textStyle={styles.historyCell}>{entry.agent}</DataTable.Cell>
                    <DataTable.Cell textStyle={styles.historyCell}>{entry.duration}</DataTable.Cell>
                    <DataTable.Cell textStyle={styles.historyLink}>View Details</DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
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
