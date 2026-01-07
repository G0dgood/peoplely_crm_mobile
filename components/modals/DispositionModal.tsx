import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import NetInfo from "@react-native-community/netinfo";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DispositionCheckboxField from "@/components/disposition-fields/DispositionCheckboxField";
import DispositionDateTimeField from "@/components/disposition-fields/DispositionDateTimeField";
import DispositionRadioField from "@/components/disposition-fields/DispositionRadioField";
import DispositionSelectField from "@/components/disposition-fields/DispositionSelectField";
import DispositionTextField from "@/components/disposition-fields/DispositionTextField";
import PageTitle from "@/components/PageTitle";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useLineOfBusiness } from "@/contexts/LineOfBusinessContext";
import { useSocket } from "@/contexts/SocketContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useDispositionSync } from "@/hooks/useDispositionSync";
import { useCreateDispositionMutation } from "@/store/services/dispositionApi";
import { saveDisposition, saveSyncedDisposition } from "@/utils/dispositionStorage";
import { toCamelCase } from "@/utils/stringUtils";

import { createModalStyles } from "@/app/modal/shared";

interface ApiError {
  data?: {
    error?: string;
    message?: string;
  };
}

interface DispositionField {
  id: string;
  name: string;
  fieldType: string;
  dropdownOptions?: string[];
  isRequired?: boolean;
  color?: string;
  sortOrder?: string;
  // Legacy support if needed
  _id?: string;
  type?: string;
  options?: string[];
  required?: boolean;
}

interface DispositionFieldEntry {
  fieldId: string;
  fieldName: string;
  fieldValue: string | number | boolean | undefined;
  fieldType?: string;
}

// Toast helpers
const toastError = (message: string) => Alert.alert("Error", message);
const toastSuccess = (message: string) => Alert.alert("Success", message);

type DispositionFormState = Record<string, any>;

type DispositionModalProps = {
  visible: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
};

export default function DispositionModal({ visible, onClose, customerId, customerName }: DispositionModalProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = useMemo(() => createModalStyles(palette), [palette]);

  const { user } = useAuth();
  const { lineOfBusinessData } = useLineOfBusiness();
  const { loadDispositionsIntoRedux } = useDispositionSync();
  const [createDisposition] = useCreateDispositionMutation();
  const { emit: send } = useSocket();

  const selectedLineOfBusinessId = lineOfBusinessData?.lineOfBusiness?._id;
  const authUser = user;

  const [formData, setFormData] = useState<DispositionFormState>({});
  const [isConnected, setIsConnected] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDateField, setCurrentDateField] = useState<string | null>(null);

  // Get dispositions from context
  const fields = useMemo(() => {
    return (lineOfBusinessData?.lineOfBusiness?.dashboardSettings?.dispositions || []) as DispositionField[];
  }, [lineOfBusinessData]);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
    });
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected ?? false);
    });
    return () => unsubscribe();
  }, []);

  // Reset or update form when modal opens
  useEffect(() => {
    if (visible && fields.length > 0) {
      const initialForm: DispositionFormState = {};

      // Initialize with defaults or empty strings based on dispositions
      fields.forEach((d) => {
        const key = toCamelCase(d.name);
        const type = d.fieldType || d.type;

        if (type === 'checkbox') {
          initialForm[key] = [];
        } else if (type === 'date' || type === 'time' || type === 'date-time') {
          initialForm[key] = null;
        } else {
          initialForm[key] = '';
        }
      });

      setFormData(initialForm);
    }
  }, [visible, fields]);

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAndPost = async () => {
    // Validate IDs
    if (!customerId || !selectedLineOfBusinessId) {
      console.error("Missing required IDs:", { customerId, selectedLineOfBusinessId });
      toastError("System Error: Missing Customer or Line of Business ID.");
      return;
    }

    // Basic validation
    const missingFields: string[] = [];
    fields.forEach((d) => {
      const isRequired = d.isRequired ?? d.required;
      if (isRequired) {
        const key = toCamelCase(d.name);
        const fieldType = d.fieldType || d.type;
        if (fieldType === 'date-time') {
          if (!formData[`${key}_date`] || !formData[`${key}_time`]) {
            missingFields.push(d.name);
          }
        } else {
          if (!formData[key]) {
            missingFields.push(d.name);
          }
        }
      }
    });

    if (missingFields.length > 0) {
      toastError(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Transform formData to array structure
    const dispositionData: DispositionFieldEntry[] = fields.map((d) => {
      const key = toCamelCase(d.name);
      const fieldType = d.fieldType || d.type;
      let value: string | number | boolean | undefined;

      if (fieldType === 'date-time') {
        const date = formData[`${key}_date`];
        const time = formData[`${key}_time`];
        if (date && time) {
          value = `${date} ${time}`;
        } else {
          value = String(date || time || '');
        }
      } else {
        value = formData[key];
      }

      return {
        fieldId: (d.id || d._id || '') as string,
        fieldName: d.name,
        fieldValue: value,
        fieldType: fieldType
      };
    });

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      let savedOnline = false;
      // Always try to save via API first unless explicitly offline
      if (isConnected) {
        try {
          // Save via API
          await createDisposition({
            fillDisposition: dispositionData,
            customerId,
            agentId: authUser?.id,
            lineOfBusinessId: selectedLineOfBusinessId || undefined,
            timestamp: new Date().toISOString(),
          }).unwrap();

          // Try to send via socket or API
          if (send) {
            send('disposition', {
              type: 'disposition',
              payload: {
                fillDisposition: dispositionData,
                customerId,
                agentId: authUser?.id,
                lineOfBusinessId: selectedLineOfBusinessId || undefined,
                timestamp: new Date().toISOString(),
              },
            });
          }

          // Save to synced dispositions for history
          saveSyncedDisposition(
            dispositionData,
            customerId,
            customerName,
            authUser?.name,
            authUser?.id,
            selectedLineOfBusinessId || undefined
          );

          toastSuccess('Disposition saved successfully');
          savedOnline = true;
          onClose();
          return;

        } catch (error: unknown) {
          console.error('Error saving disposition online:', error);

          // If the server returns a specific error message, show it
          const serverError = (error as ApiError)?.data?.error || (error as ApiError)?.data?.message;
          if (serverError) {
            toastError(serverError);
            // Do not return here - continue to save offline
          }
        }
      }

      if (!savedOnline) {
        // Adapt for offline storage
        await saveDisposition({
          ...formData,
          fillDisposition: dispositionData,
          agentName: user?.name || "Offline Entry",
          agentId: user?.id || "Offline Entry",
          dateContacted: new Date().toLocaleString(),
          customerId,
          customerName,
          lineOfBusinessId: selectedLineOfBusinessId
        });

        await loadDispositionsIntoRedux();

        Alert.alert(
          "Saved Offline",
          "Disposition saved offline. It will be synced when network is available.",
          [
            {
              text: "OK",
              onPress: onClose,
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error saving disposition:", error);
      Alert.alert("Error", "Failed to save disposition. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = (field: any) => {
    const key = toCamelCase(field.name);
    const value = formData[key];
    const fieldType = field.fieldType || field.type;

    switch (fieldType) {
      case "text":
      case "single-line-text":
      case "number":
      case "phone":
      case "email":
      case "textarea":
      case "multi-line-text":
        return (
          <DispositionTextField
            key={field.id || field._id}
            field={field}
            value={value}
            onChange={(text: string) => handleInputChange(key, text)}
          />
        );

      case "dropdown":
        return (
          <DispositionSelectField
            key={field.id || field._id}
            field={field}
            value={value}
            onChange={(val: string) => handleInputChange(key, val)}
            palette={palette}
          />
        );

      case "radio":
      case "radio-select":
        return (
          <DispositionRadioField
            key={field.id || field._id}
            field={field}
            value={value}
            onChange={(val: string) => handleInputChange(key, val)}
            palette={palette}
          />
        );

      case "checkbox":
        return (
          <DispositionCheckboxField
            key={field.id || field._id}
            field={field}
            value={value}
            onChange={(val: string[]) => handleInputChange(key, val)}
            palette={palette}
          />
        );

      case "date-time":
        return (
          <DispositionDateTimeField
            key={field.id || field._id}
            field={field}
            fieldKey={key}
            dateValue={formData[`${key}_date`]}
            timeValue={formData[`${key}_time`]}
            onOpenPicker={(pickerKey: string) => {
              setCurrentDateField(pickerKey);
              setShowDatePicker(true);
            }}
            palette={palette}
          />
        );

      case "date":
      case "time":
        return (
          <DispositionDateTimeField
            key={field.id || field._id}
            field={field}
            fieldKey={key}
            value={value}
            onOpenPicker={(pickerKey: string) => {
              setCurrentDateField(pickerKey);
              setShowDatePicker(true);
            }}
            palette={palette}
          />
        );

      default:
        return null;
    }
  };

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
              style={{ width: "100%", alignItems: "center" }}
            >
              <View style={[styles.container, { backgroundColor: palette.accentWhite }]}>
                <View style={styles.modalHeader}>
                  <View style={styles.header}>
                    <View style={styles.headerTitleRow}>
                      <PageTitle title={"Disposition"} />
                      {!isConnected && (
                        <View
                          style={[
                            styles.offlineBadge,
                            { backgroundColor: palette.statusWarning },
                          ]}
                        >
                          <Ionicons
                            name="cloud-offline-outline"
                            size={14}
                            color={palette.textInverse}
                          />
                          <Text style={styles.offlineBadgeText}>Offline</Text>
                        </View>
                      )}
                    </View>
                    {!isConnected && (
                      <Text
                        style={[
                          styles.offlineMessage,
                          { color: palette.textSecondary },
                        ]}
                      >
                        Data will be synced when network is available
                      </Text>
                    )}
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
                  contentContainerStyle={styles.form}
                  showsVerticalScrollIndicator={false}
                  style={{ flex: 1 }}
                >
                  {fields.map((field: any) => renderField(field))}
                </ScrollView>

                <View style={styles.footer}>
                  <TouchableOpacity activeOpacity={0.7} onPress={() => {
                    // TODO: Add view history action or remove button
                    Alert.alert("Info", "History view is available on the details screen.");
                  }}>
                    <Text style={styles.cancel}>View History</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveButton, isSaving && { opacity: 0.6 }]}
                    activeOpacity={0.7}
                    onPress={handleSaveAndPost}
                    disabled={isSaving}
                  >
                    <Text style={styles.saveButtonText}>
                      {isSaving
                        ? "Saving..."
                        : isConnected
                          ? "Save & Post"
                          : "Save (Offline)"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>

        {/* Shared Date/Time Picker */}
        {showDatePicker && currentDateField && (
          (() => {
            const baseKey = currentDateField.replace(/(_date|_time)$/, '');
            const isTimeSuffix = currentDateField.endsWith('_time');

            const field = fields.find((f: any) => toCamelCase(f.name) === baseKey);
            let mode: "date" | "time" = "date";

            if (isTimeSuffix) {
              mode = "time";
            } else if (field?.type === "time") {
              mode = "time";
            }

            const value = formData[currentDateField] instanceof Date ? formData[currentDateField] : new Date();

            return (
              Platform.OS === 'ios' ? (
                <Modal
                  transparent
                  animationType="fade"
                  visible={showDatePicker}
                  onRequestClose={() => setShowDatePicker(false)}
                >
                  <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: palette.accentWhite, paddingBottom: 20 }]}>
                      <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>Select {field?.name}</Text>
                        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                          <Text style={{ color: palette.interactivePrimary, fontSize: 16, fontWeight: '600' }}>Done</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={value}
                        mode={mode}
                        display="spinner"
                        onChange={(event, selectedDate) => {
                          if (selectedDate) {
                            handleInputChange(currentDateField, selectedDate);
                          }
                        }}
                        textColor={palette.textPrimary}
                      />
                    </View>
                  </View>
                </Modal>
              ) : (
                <DateTimePicker
                  value={value}
                  mode={mode}
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      handleInputChange(currentDateField, selectedDate);
                    }
                  }}
                />
              )
            );
          })()
        )}
      </SafeAreaView>
    </Modal>
  );
}
