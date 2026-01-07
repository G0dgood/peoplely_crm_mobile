import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  KeyboardAvoidingView,
  Modal,
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

import { createModalStyles } from "@/app/modal/shared";

const createStyles = (palette: typeof Colors.light) =>
  StyleSheet.create({
    ...createModalStyles(palette),
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

type DispositionHistoryDetailsModalProps = {
  visible: boolean;
  onClose: () => void;
  disposition: any;
};

export default function DispositionHistoryDetailsModal({ visible, onClose, disposition }: DispositionHistoryDetailsModalProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = useMemo(() => createStyles(palette), [palette]);

  // Extract dynamic fields
  const dynamicFields = useMemo(() => {
    if (!disposition || !disposition.dispositionData) return [];

    let fields: { label: string; value: string }[] = [];

    if (Array.isArray(disposition.dispositionData)) {
      fields = disposition.dispositionData.map((f: any) => ({
        label: f.fieldName,
        value: String(f.fieldValue || f.value || "-"),
      }));
    } else if (typeof disposition.dispositionData === "object") {
      // Offline/Flat format
      fields = Object.entries(disposition.dispositionData)
        .filter(
          ([key]) =>
            ![
              "id",
              "customerId",
              "agentId",
              "agentName",
              "date",
              "time",
              "synced",
              "createdAt",
              "dateContacted",
            ].includes(key)
        )
        .map(([key, value]) => ({
          label: key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase()), // CamelCase to Title Case
          value: String(value || "-"),
        }));
    }

    return fields;
  }, [disposition]);

  if (!disposition) {
    return null;
  }

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
                  <View>
                    <Text style={styles.title}>Disposition Details</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={24} color={palette.textPrimary} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  contentContainerStyle={styles.content}
                  showsVerticalScrollIndicator={false}
                  style={{ flex: 1 }}
                >
                  <View style={styles.topSection}>
                    <View style={styles.twoColumnLayout}>
                      <View style={styles.leftColumn}>
                        <View style={styles.fieldRow}>
                          <Text style={styles.fieldLabel}>Agent Name</Text>
                          <Text style={styles.fieldValue}>
                            {disposition.agent || disposition.agentName || "-"}
                          </Text>
                        </View>
                        <View style={styles.fieldRow}>
                          <Text style={styles.fieldLabel}>Date Contacted</Text>
                          <Text style={styles.fieldValue}>
                            {disposition.date} at {disposition.time}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Dynamic Fields Rendering */}
                  {dynamicFields.map((field, index) => {
                    // Create pairs for 2-column layout
                    if (index % 2 !== 0) return null; // Skip odd indices, processed with even

                    const nextField = dynamicFields[index + 1];

                    return (
                      <View key={index} style={styles.twoColumnLayout}>
                        <View style={styles.leftColumn}>
                          <View style={styles.fieldRow}>
                            <Text style={styles.fieldLabel}>{field.label}</Text>
                            <Text style={styles.fieldValue}>{field.value}</Text>
                          </View>
                        </View>
                        <View style={styles.rightColumn}>
                          {nextField && (
                            <View style={styles.fieldRow}>
                              <Text style={styles.fieldLabel}>{nextField.label}</Text>
                              <Text style={styles.fieldValue}>{nextField.value}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
}
