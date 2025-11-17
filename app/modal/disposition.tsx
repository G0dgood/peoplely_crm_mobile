import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import NetInfo from "@react-native-community/netinfo";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TextField from "@/components/forms/TextField";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useDispositionSync } from "@/hooks/useDispositionSync";
import { saveDisposition } from "@/utils/dispositionStorage";

import PageTitle from "@/components/PageTitle";
import { createModalStyles } from "./shared";

export default function DispositionModal() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = useMemo(() => createModalStyles(palette), [palette]);
  const { loadDispositionsIntoRedux } = useDispositionSync();

  const [callAnswered, setCallAnswered] = useState("");
  const [reasonForNonPayment, setReasonForNonPayment] = useState("");
  const [reasonForNotWatching, setReasonForNotWatching] = useState("");
  const [commitmentDate, setCommitmentDate] = useState<Date | null>(null);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [comment, setComment] = useState("");
  const [isConnected, setIsConnected] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Dropdown modals
  const [showCallAnsweredModal, setShowCallAnsweredModal] = useState(false);
  const [showReasonNonPaymentModal, setShowReasonNonPaymentModal] =
    useState(false);
  const [showReasonNotWatchingModal, setShowReasonNotWatchingModal] =
    useState(false);
  const [showCommitmentDateModal, setShowCommitmentDateModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Dropdown options
  const callAnsweredOptions = ["Yes", "No"];
  const reasonNonPaymentOptions = [
    "financial-hardship",
    "payment-processing",
    "billing-error",
    "other",
  ];
  const reasonNotWatchingOptions = [
    "not-interested",
    "already-subscribed",
    "technical-issues",
    "other",
  ];

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
    });

    // Check initial network status
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSave = async () => {
    if (!amount.trim() && !comment.trim()) {
      Alert.alert("Validation", "Please fill in at least Amount or Comment");
      return;
    }

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const now = new Date();
      const commitmentDateStr = commitmentDate
        ? commitmentDate.toLocaleDateString("en-GB")
        : "";
      const dateStr = date
        ? date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : now.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          });
      const timeStr = time
        ? time.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        : now.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });

      const savedDisposition = await saveDisposition({
        callAnswered: callAnswered || "yes",
        reasonForNonPayment: reasonForNonPayment || "-",
        reasonForNotWatching: reasonForNotWatching || "-",
        commitmentDate: commitmentDateStr,
        amount: amount || "0",
        date: dateStr,
        time: timeStr,
        comment: comment || "-",
        agentName: "Offline Entry",
        agentId: "Offline Entry",
        dateContacted: `${dateStr} at ${timeStr}`,
      });

      // Reload dispositions into Redux to update the dashboard
      await loadDispositionsIntoRedux();

      Alert.alert(
        isConnected ? "Success" : "Saved Offline",
        isConnected
          ? "Disposition saved and synced successfully"
          : "Disposition saved offline. It will be synced when network is available.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error("Error saving disposition:", error);
      Alert.alert("Error", "Failed to save disposition. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

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

          <ScrollView
            contentContainerStyle={styles.form}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowCallAnsweredModal(true);
              }}
              activeOpacity={0.7}
            >
              <TextField
                label="Call Answered"
                placeholder="Select"
                editable={false}
                value={callAnswered}
                trailingIcon={
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={palette.textSecondary}
                  />
                }
                onPressTrailingIcon={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowCallAnsweredModal(true);
                }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowReasonNonPaymentModal(true);
              }}
              activeOpacity={0.7}
            >
              <TextField
                label="Reason For Non Payment"
                placeholder="Select"
                editable={false}
                value={reasonForNonPayment}
                trailingIcon={
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={palette.textSecondary}
                  />
                }
                onPressTrailingIcon={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowReasonNonPaymentModal(true);
                }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowReasonNotWatchingModal(true);
              }}
              activeOpacity={0.7}
            >
              <TextField
                label="Reason for not watching"
                placeholder="Select"
                editable={false}
                value={reasonForNotWatching}
                trailingIcon={
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={palette.textSecondary}
                  />
                }
                onPressTrailingIcon={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowReasonNotWatchingModal(true);
                }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowCommitmentDateModal(true);
              }}
              activeOpacity={0.7}
            >
              <TextField
                label="Commitment Date"
                placeholder="dd/mm/yyyy"
                editable={false}
                value={
                  commitmentDate
                    ? commitmentDate.toLocaleDateString("en-GB")
                    : ""
                }
                trailingIcon={
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={palette.textSecondary}
                  />
                }
                onPressTrailingIcon={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowCommitmentDateModal(true);
                }}
              />
            </TouchableOpacity>

            <TextField
              label="Amount to Pay"
              placeholder="Enter amount"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowDatePicker(true);
              }}
              activeOpacity={0.7}
            >
              <TextField
                label="Date"
                placeholder="dd/mm/yyyy"
                editable={false}
                value={date ? date.toLocaleDateString("en-GB") : ""}
                trailingIcon={
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={palette.textSecondary}
                  />
                }
                onPressTrailingIcon={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowDatePicker(true);
                }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowTimePicker(true);
              }}
              activeOpacity={0.7}
            >
              <TextField
                label="Time"
                placeholder="--:--"
                editable={false}
                value={
                  time
                    ? time.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : ""
                }
                trailingIcon={
                  <Ionicons
                    name="time-outline"
                    size={20}
                    color={palette.textSecondary}
                  />
                }
                onPressTrailingIcon={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowTimePicker(true);
                }}
              />
            </TouchableOpacity>

            <TextField
              label="Comment"
              multiline
              numberOfLines={4}
              placeholder="Add comment"
              style={{ height: 120, textAlignVertical: "top" }}
              value={comment}
              onChangeText={setComment}
            />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.cancel}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, isSaving && { opacity: 0.6 }]}
              activeOpacity={0.7}
              onPress={handleSave}
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
      </KeyboardAvoidingView>

      {/* Call Answered Dropdown Modal */}
      <Modal
        visible={showCallAnsweredModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCallAnsweredModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCallAnsweredModal(false)}
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
                Select Call Answered
              </Text>
              <TouchableOpacity
                onPress={() => setShowCallAnsweredModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.modalList}
              showsVerticalScrollIndicator={false}
            >
              {callAnsweredOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.modalOption,
                    callAnswered === option && {
                      backgroundColor: palette.offWhite2,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setCallAnswered(option);
                    setShowCallAnsweredModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      {
                        color:
                          callAnswered === option
                            ? palette.interactivePrimary
                            : palette.textPrimary,
                        fontWeight: callAnswered === option ? "600" : "400",
                      },
                    ]}
                  >
                    {option}
                  </Text>
                  {callAnswered === option && (
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

      {/* Reason For Non Payment Dropdown Modal */}
      <Modal
        visible={showReasonNonPaymentModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReasonNonPaymentModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowReasonNonPaymentModal(false)}
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
                Select Reason For Non Payment
              </Text>
              <TouchableOpacity
                onPress={() => setShowReasonNonPaymentModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.modalList}
              showsVerticalScrollIndicator={false}
            >
              {reasonNonPaymentOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.modalOption,
                    reasonForNonPayment === option && {
                      backgroundColor: palette.offWhite2,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setReasonForNonPayment(option);
                    setShowReasonNonPaymentModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      {
                        color:
                          reasonForNonPayment === option
                            ? palette.interactivePrimary
                            : palette.textPrimary,
                        fontWeight:
                          reasonForNonPayment === option ? "600" : "400",
                      },
                    ]}
                  >
                    {option}
                  </Text>
                  {reasonForNonPayment === option && (
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

      {/* Reason For Not Watching Dropdown Modal */}
      <Modal
        visible={showReasonNotWatchingModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReasonNotWatchingModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowReasonNotWatchingModal(false)}
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
                Select Reason For Not Watching
              </Text>
              <TouchableOpacity
                onPress={() => setShowReasonNotWatchingModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.modalList}
              showsVerticalScrollIndicator={false}
            >
              {reasonNotWatchingOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.modalOption,
                    reasonForNotWatching === option && {
                      backgroundColor: palette.offWhite2,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setReasonForNotWatching(option);
                    setShowReasonNotWatchingModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      {
                        color:
                          reasonForNotWatching === option
                            ? palette.interactivePrimary
                            : palette.textPrimary,
                        fontWeight:
                          reasonForNotWatching === option ? "600" : "400",
                      },
                    ]}
                  >
                    {option}
                  </Text>
                  {reasonForNotWatching === option && (
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

      {/* Commitment Date Picker Modal (iOS) */}
      {Platform.OS === "ios" && showCommitmentDateModal && (
        <Modal
          visible={showCommitmentDateModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCommitmentDateModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowCommitmentDateModal(false)}
          >
            <View
              style={[
                styles.datePickerModal,
                { backgroundColor: palette.accentWhite },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text
                  style={[styles.modalTitle, { color: palette.textPrimary }]}
                >
                  Select Commitment Date
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCommitmentDateModal(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={palette.textPrimary}
                  />
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={commitmentDate || new Date()}
                mode="date"
                display="spinner"
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setCommitmentDate(selectedDate);
                  }
                }}
                style={styles.datePicker}
              />
              <View style={styles.datePickerFooter}>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowCommitmentDateModal(false)}
                >
                  <Text
                    style={[
                      styles.datePickerButtonText,
                      { color: palette.textPrimary },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.datePickerButton,
                    {
                      backgroundColor: palette.interactivePrimary,
                      borderColor: palette.interactivePrimary,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowCommitmentDateModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.datePickerButtonText,
                      { color: palette.textInverse },
                    ]}
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Date Picker */}
      {showDatePicker && (
        <>
          {Platform.OS === "ios" ? (
            <Modal
              visible={showDatePicker}
              transparent
              animationType="fade"
              onRequestClose={() => setShowDatePicker(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowDatePicker(false)}
              >
                <View
                  style={[
                    styles.datePickerModal,
                    { backgroundColor: palette.accentWhite },
                  ]}
                >
                  <View style={styles.modalHeader}>
                    <Text
                      style={[
                        styles.modalTitle,
                        { color: palette.textPrimary },
                      ]}
                    >
                      Select Date
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(false)}
                      style={styles.modalCloseButton}
                    >
                      <Ionicons
                        name="close"
                        size={24}
                        color={palette.textPrimary}
                      />
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={date || new Date()}
                    mode="date"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) {
                        setDate(selectedDate);
                      }
                    }}
                    style={styles.datePicker}
                  />
                  <View style={styles.datePickerFooter}>
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text
                        style={[
                          styles.datePickerButtonText,
                          { color: palette.textPrimary },
                        ]}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.datePickerButton,
                        {
                          backgroundColor: palette.interactivePrimary,
                          borderColor: palette.interactivePrimary,
                        },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setShowDatePicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.datePickerButtonText,
                          { color: palette.textInverse },
                        ]}
                      >
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </Modal>
          ) : (
            <DateTimePicker
              value={date || new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (event.type === "set" && selectedDate) {
                  setDate(selectedDate);
                }
              }}
            />
          )}
        </>
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <>
          {Platform.OS === "ios" ? (
            <Modal
              visible={showTimePicker}
              transparent
              animationType="fade"
              onRequestClose={() => setShowTimePicker(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowTimePicker(false)}
              >
                <View
                  style={[
                    styles.datePickerModal,
                    { backgroundColor: palette.accentWhite },
                  ]}
                >
                  <View style={styles.modalHeader}>
                    <Text
                      style={[
                        styles.modalTitle,
                        { color: palette.textPrimary },
                      ]}
                    >
                      Select Time
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowTimePicker(false)}
                      style={styles.modalCloseButton}
                    >
                      <Ionicons
                        name="close"
                        size={24}
                        color={palette.textPrimary}
                      />
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={time || new Date()}
                    mode="time"
                    display="spinner"
                    onChange={(event, selectedTime) => {
                      if (selectedTime) {
                        setTime(selectedTime);
                      }
                    }}
                    style={styles.datePicker}
                  />
                  <View style={styles.datePickerFooter}>
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={() => setShowTimePicker(false)}
                    >
                      <Text
                        style={[
                          styles.datePickerButtonText,
                          { color: palette.textPrimary },
                        ]}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.datePickerButton,
                        {
                          backgroundColor: palette.interactivePrimary,
                          borderColor: palette.interactivePrimary,
                        },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setShowTimePicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.datePickerButtonText,
                          { color: palette.textInverse },
                        ]}
                      >
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </Modal>
          ) : (
            <DateTimePicker
              value={time || new Date()}
              mode="time"
              display="default"
              onChange={(event, selectedTime) => {
                setShowTimePicker(false);
                if (event.type === "set" && selectedTime) {
                  setTime(selectedTime);
                }
              }}
            />
          )}
        </>
      )}

      {/* Android Commitment Date Picker */}
      {Platform.OS === "android" && showCommitmentDateModal && (
        <DateTimePicker
          value={commitmentDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowCommitmentDateModal(false);
            if (event.type === "set" && selectedDate) {
              setCommitmentDate(selectedDate);
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}
