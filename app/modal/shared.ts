import { StyleSheet } from "react-native";

import { Colors } from "@/constants/theme";

export const CUSTOMER_DETAILS = {
  firstName: "Jane",
  lastName: "Doe",
  email: "janedoe@example.com",
  phone: "08023456789",
  middleName: "-",
  address: "-",
  history: [
    { date: "April 7, 2025", time: "9:14 AM", agent: "John Doe", duration: "2m 23s" },
    { date: "March 23, 2025", time: "8:30 AM", agent: "Jane Doe", duration: "1m 56s" },
    { date: "March 23, 2025", time: "8:30 AM", agent: "Jane Doe", duration: "1m 56s" },
  ],
};

export const createModalStyles = (palette: (typeof Colors)["light"]) =>
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
    container: { 
      padding: 24,
      gap: 20,
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
      borderRadius: 18,
      backgroundColor: palette.bgSecondary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: palette.shadowColor,
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 2,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: palette.textPrimary,
    },
    form: {
      gap: 20,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 4,
    },
    addFields: {
      color: palette.interactivePrimary,
      fontWeight: "600",
      fontSize: 14,
    },
    footerActions: {
      flexDirection: "row",
      gap: 16,
      alignItems: "center",
    },
    cancel: {
      color: palette.textSecondary,
      fontWeight: "600",
    },
    saveButton: {
      backgroundColor: palette.primary, 
      paddingVertical: 10,
      paddingHorizontal: 24,
    },
    saveButtonText: {
      color: palette.textInverse,
      fontWeight: "600",
    },
    footerRight: {
      alignItems: "flex-end",
      marginTop: 16,
    },
    sendButton: {
      backgroundColor: palette.primary,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 24,
    },
    sendButtonText: {
      color: palette.textInverse,
      fontWeight: "600",
    },
    headerButtons: {
      flexDirection: "row",
      gap: 12,
      alignItems: "center",
    },
    headerAction: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: palette.bgSecondary,
    },
    headerActionText: {
      fontWeight: "600",
      color: palette.interactivePrimary,
    },
    headerActionPrimary: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: palette.primary,
    },
    headerActionPrimaryText: {
      color: palette.textInverse,
      fontWeight: "600",
    },
    detailsContent: {
      gap: 20,
      paddingBottom: 8,
    },
    sectionCard: {
      borderRadius: 16,
      backgroundColor: palette.accentWhite,
      padding: 20,
      gap: 16,
      shadowColor: palette.shadowColor,
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 24,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: palette.textPrimary,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    link: {
      color: palette.interactivePrimary,
      fontWeight: "600",
    },
    detailGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 20,
    },
    historyHeader: {
      fontSize: 12,
      fontWeight: "600",
      color: palette.textSecondary,
    },
    historyCell: {
      fontSize: 13,
      color: palette.textPrimary,
    },
    historyLink: {
      fontSize: 13,
      fontWeight: "600",
      color: palette.interactivePrimary,
    },
    twoColumn: {
      flexDirection: "row",
      gap: 16,
      width: "100%",
    },
    twoColumnInner: {
      flex: 1,
    },
  });

export const createDetailStyles = (palette: (typeof Colors)["light"]) =>
  StyleSheet.create({
    item: {
      width: "48%",
      gap: 6,
    },
    label: {
      fontSize: 13,
      color: palette.primaryLighter,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    value: {
      fontSize: 15,
      fontWeight: "600",
      color: palette.textPrimary,
    },
  });
