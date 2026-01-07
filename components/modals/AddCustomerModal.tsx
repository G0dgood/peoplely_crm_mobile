import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
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
import PageTitle from "@/components/PageTitle";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { createModalStyles } from "@/app/modal/shared";

type AddCustomerModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function AddCustomerModal({ visible, onClose }: AddCustomerModalProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = useMemo(() => createModalStyles(palette), [palette]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

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
              <View
                style={[styles.container, { backgroundColor: palette.accentWhite }]}
              >
                <View style={styles.modalHeader}>
                  <PageTitle title="Add Customer" />
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
                  <TextField
                    label="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Enter First Name"
                    autoCapitalize="words"
                  />
                  <TextField
                    label="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Enter Last Name"
                    autoCapitalize="words"
                  />
                  <TextField
                    label="Email Address"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <TextField
                    label="Mobile"
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Enter Mobile Number"
                    keyboardType="phone-pad"
                  />
                </ScrollView>

                <View style={styles.footer}>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text style={styles.addFields}>Add Fields</Text>
                  </TouchableOpacity>
                  <View style={styles.footerActions}>
                    <TouchableOpacity
                      onPress={onClose}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.cancel}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} activeOpacity={0.7}>
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
}
