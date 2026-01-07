import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
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
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { createModalStyles } from "@/app/modal/shared";

type SmsModalProps = {
  visible: boolean;
  onClose: () => void;
  phone?: string;
};

export default function SmsModal({ visible, onClose, phone: initialPhone }: SmsModalProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = useMemo(() => createModalStyles(palette), [palette]);

  const [phone, setPhone] = useState(initialPhone || "");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (visible) {
      setPhone(initialPhone || "");
      setMessage("");
    }
  }, [visible, initialPhone]);

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
                  <View>
                    <Text style={styles.title}>SMS</Text>
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
                  <TextField
                    label="Phone"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholder="Enter phone number"
                  />
                  <TextField
                    label="Message"
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Enter your message"
                    multiline
                    numberOfLines={4}
                    style={{ height: 140, textAlignVertical: "top" }}
                  />
                </ScrollView>

                <View style={styles.footerRight}>
                  <TouchableOpacity style={styles.sendButton} activeOpacity={0.7}>
                    <Text style={styles.sendButtonText}>Send</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
}
