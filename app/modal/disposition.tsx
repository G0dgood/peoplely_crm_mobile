import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
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

import { createModalStyles } from "./shared";

export default function DispositionModal() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = useMemo(() => createModalStyles(palette), [palette]);

  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: "rgba(0,0,0,0.4)" }]}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.container, { backgroundColor: palette.accentWhite }]}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={18} color={palette.textPrimary} />
          </TouchableOpacity>
          <View style={styles.header}>
            <Text style={styles.title}>Disposition</Text>
          </View>

          <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.twoColumn}>
              <TextField label="Call Answered" placeholder="Select" editable={false} />
              <TextField label="Reason For Non Payment" placeholder="Select" editable={false} />
            </View>
            <View style={styles.twoColumn}>
              <TextField label="Reason for not watching" placeholder="Select" editable={false} />
              <View style={styles.twoColumnInner}>
                <TextField label="Commitment Date" placeholder="dd/mm/yyyy" editable={false} />
              </View>
            </View>
            <View style={styles.twoColumn}>
              <TextField
                label="Amount to Pay"
                placeholder="Enter amount"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              <View style={styles.twoColumn}>
                <TextField label="Date" placeholder="dd/mm/yyyy" editable={false} />
                <TextField label="Time" placeholder="--:--" editable={false} />
              </View>
            </View>
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
            <TouchableOpacity style={styles.saveButton} activeOpacity={0.7}>
              <Text style={styles.saveButtonText}>Save & Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
