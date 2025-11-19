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
  View
} from "react-native";

import { PeoplelyLogo } from "@/assets/svg/PeoplelyLogo";
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
        <View style={styles.logoContainer}>
          <View style={styles.peoplelyTextContainer}>
            <PeoplelyLogo width={40} />
            <Text style={styles.peoplely}>Peoplely</Text>
          </View>

          <Text style={styles.subtitle}>
            Let&apos;s get you logged in to continue building your investment
            portfolio.
          </Text>
        </View>
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
          style={styles.forgotpassword}
          onPress={() => {
            router.push("/auth/forgot-password");
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Text style={styles.forgotpasswordText}>I forgot my password</Text>
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
        <Text style={styles.footerText}>Powered by ProductLap</Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const createStyles = (palette: (typeof Colors)["light"]) =>
  StyleSheet.create({

    forgotpasswordText: {
      fontSize: 14,
      color: palette.primary,
      fontWeight: "500",
    },

    forgotpassword: {
      flexDirection: "row",
      justifyContent: "flex-end"
    },

    peoplely: {
      color: palette.textPrimary,
      fontSize: 28,
      fontWeight: "600",
      letterSpacing: 0.4,
      marginLeft: 8,
    },

    peoplelyTextContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    container: {
      flex: 1,
      backgroundColor: palette.background,
      paddingHorizontal: 24,
      paddingTop: 60,
    },
    header: {
      marginBottom: 48,
    },
    logoContainer: {
      alignItems: "flex-start",
      justifyContent: "flex-start",
      // marginBottom: 12,
    },
    logo: {
      width: 120,
      height: 60,
      // marginBottom: 12,
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
      backgroundColor: palette.interactivePrimary,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 12,
      borderWidth: 1,
      borderColor: palette.interactivePrimary,
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
