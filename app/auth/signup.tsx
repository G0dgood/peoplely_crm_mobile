import { router } from "expo-router";
import { useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function SignupScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/auth/login");
    }
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <Text style={[styles.title, { color: palette.textPrimary }]}>
        Sign up
      </Text>
      <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
        Placeholder screen for your registration flow.
      </Text>

      <TouchableOpacity style={[styles.button, { backgroundColor: palette.primary }]} onPress={handleBack}>
        <Text style={[styles.buttonText, { color: palette.textInverse }]}>Back to login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
  },
  button: {
    marginTop: 12,
    borderRadius: 0,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
