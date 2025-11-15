import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

// Sample data - replace with actual data from props or context
const DISPOSITION_DATA = {
  agentName: "Offline Entry",
  agentId: "Offline Entry",
  dateContacted: "March 22, 3 at 12:13 AM",
  callAnswered: "yes",
  reasonForNotWatching: "-",
  amountToPay: "3333",
  comment: "dddddf",
  reasonForNonPayment: "financial-hardship",
  commitmentDate: "1667-02-22",
  dateAndTime: "0003-03-22 22:02",
};

const createStyles = (palette: typeof Colors.light) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 16,
    },
    flex: {
      flex: 1,
      justifyContent: "center",
    },
    modalContent: {
      padding: 24,
      gap: 20,
      maxHeight: "80%",
      shadowColor: palette.shadowColor,
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 16 },
      shadowRadius: 32,
      elevation: 6,
    },
    closeButton: {
      position: "absolute",
      top: 16,
      right: 16,
      width: 36,
      height: 36,
      borderRadius: 0,
      backgroundColor: palette.bgSecondary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: palette.shadowColor,
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 3,
      zIndex: 10,
    },
    header: {
      marginTop: 8,
      marginBottom: 8,
    },
    title: {
      fontSize: 20,
      fontWeight: "600",
      color: palette.textPrimary,
    },
    content: {
      paddingBottom: 20,
    },
    topSection: {
      marginBottom: 24,
    },
    fieldRow: {
      marginBottom: 16,
    },
    fieldLabel: {
      fontSize: 12,
      fontWeight: "400",
      color: palette.textSecondary,
      marginBottom: 4,
    },
    fieldValue: {
      fontSize: 16,
      fontWeight: "600",
      color: palette.textPrimary,
    },
    twoColumnLayout: {
      flexDirection: "row",
      gap: 20,
      marginTop: 8,
    },
    leftColumn: {
      flex: 1,
    },
    rightColumn: {
      flex: 1,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      paddingTop: 20,
      marginTop: 20,
      borderTopWidth: 1,
      borderTopColor: palette.mediumGray,
    },
    closeFooterButton: {
      backgroundColor: palette.interactivePrimary,
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 0,
      borderWidth: 1,
      borderColor: palette.interactivePrimary,
      alignItems: "center",
      justifyContent: "center",
    },
    closeFooterButtonText: {
      color: palette.textInverse,
      fontSize: 14,
      fontWeight: "600",
    },
  });

export default function DispositionHistoryDetailsModal() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: "rgba(0,0,0,0.4)" }]}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.modalContent, { backgroundColor: palette.accentWhite }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={18} color={palette.textPrimary} />
          </TouchableOpacity>
          <View style={styles.header}>
            <Text style={styles.title}>Disposition History</Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Top Section */}
            <View style={styles.topSection}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>AGENT NAME</Text>
                <Text style={styles.fieldValue}>{DISPOSITION_DATA.agentName}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>AGENT ID</Text>
                <Text style={styles.fieldValue}>{DISPOSITION_DATA.agentId}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>DATE CONTACTED</Text>
                <Text style={styles.fieldValue}>{DISPOSITION_DATA.dateContacted}</Text>
              </View>
            </View>

            {/* Two Column Layout */}
            <View style={styles.twoColumnLayout}>
              {/* Left Column */}
              <View style={styles.leftColumn}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>CALL ANSWERED</Text>
                  <Text style={styles.fieldValue}>{DISPOSITION_DATA.callAnswered}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>REASON FOR NOT WATCHING</Text>
                  <Text style={styles.fieldValue}>
                    {DISPOSITION_DATA.reasonForNotWatching}
                  </Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>AMOUNT TO PAY</Text>
                  <Text style={styles.fieldValue}>{DISPOSITION_DATA.amountToPay}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>COMMENT</Text>
                  <Text style={styles.fieldValue}>{DISPOSITION_DATA.comment}</Text>
                </View>
              </View>

              {/* Right Column */}
              <View style={styles.rightColumn}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>REASON FOR NON PAYMENT</Text>
                  <Text style={styles.fieldValue}>
                    {DISPOSITION_DATA.reasonForNonPayment}
                  </Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>COMMITMENT DATE</Text>
                  <Text style={styles.fieldValue}>
                    {DISPOSITION_DATA.commitmentDate}
                  </Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>DATE AND TIME</Text>
                  <Text style={styles.fieldValue}>
                    {DISPOSITION_DATA.dateAndTime}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer with Close Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.closeFooterButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.closeFooterButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

