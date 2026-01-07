import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

interface SelectionModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: { label: string; value: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
  palette: any;
}

const SelectionModal: React.FC<SelectionModalProps> = ({
  visible,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
  palette,
}) => {
  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContent: {
      width: "100%",
      maxHeight: "80%",
      borderRadius: 16,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 5,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "700",
    },
    modalCloseButton: {
      padding: 4,
    },
    modalList: {
      maxHeight: 400,
    },
    modalOption: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginBottom: 4,
    },
    modalOptionText: {
      fontSize: 16,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={[styles.modalContent, { backgroundColor: palette.accentWhite }]}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color={palette.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  selectedValue === option.value && {
                    backgroundColor: palette.offWhite2,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelect(option.value);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    {
                      color:
                        selectedValue === option.value
                          ? palette.interactivePrimary
                          : palette.textPrimary,
                      fontWeight: selectedValue === option.value ? "600" : "400",
                    },
                  ]}
                >
                  {option.label}
                </Text>
                {selectedValue === option.value && (
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
  );
};

export default SelectionModal;
