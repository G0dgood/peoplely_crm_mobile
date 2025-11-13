import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import TextField from "@/components/forms/TextField";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

const Login = () => {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = useMemo(() => createStyles(palette), [palette]);

  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing information", "Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn(email, password);
      if (result.success) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.replace("/(tabs)");
      } else {
        Alert.alert("Login Failed", result.error || "An error occurred.");
      }
    } catch (_error) {
      console.error("Sign-in error", _error);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () =>
    setIsPasswordVisible((prev) => !prev);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>
          Let’s get you logged in to continue building your investment
          portfolio.
        </Text>
      </View>

      <View style={styles.form}>
        <TextField
          label="Email address"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry={!isPasswordVisible}
          trailingIcon={
            <MaterialCommunityIcons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={palette.primary}
            />
          }
          onPressTrailingIcon={togglePasswordVisibility}
        />

        <TouchableOpacity
          onPress={() => {
            router.push("/auth/forgot-password");
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Text style={styles.forgotPassword}>I forgot my password</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signInButton}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={palette.accentWhite} />
          ) : (
            <Text style={styles.signInText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don’t have an account?</Text>
        <TouchableOpacity
          onPress={() => {
            router.push("/auth/signup");
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Text style={styles.footerLink}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const createStyles = (palette: (typeof Colors)["light"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
      paddingHorizontal: 24,
      paddingTop: 80,
    },
    header: {
      marginBottom: 48,
    },
    title: {
      fontSize: 28,
      fontWeight: "600",
      color: palette.textPrimary,
      marginBottom: 12,
    },
    subtitle: {
      fontSize: 15,
      lineHeight: 22,
      color: palette.textSecondary,
    },
    form: {
      gap: 24,
    },
    forgotPassword: {
      alignSelf: "center",
      color: palette.primary,
      fontWeight: "600",
    },
    signInButton: {
      height: 52,
      backgroundColor: palette.primary,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 12,
      shadowColor: palette.shadowColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 4,
    },
    signInText: {
      fontSize: 16,
      fontWeight: "600",
      color: palette.textInverse,
    },
    footer: {
      marginTop: "auto",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
      marginBottom: 32,
    },
    footerText: {
      color: palette.primaryLighter,
    },
    footerLink: {
      color: palette.primary,
      fontWeight: "600",
    },
  });

export default Login;
