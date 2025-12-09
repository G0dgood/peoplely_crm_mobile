import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AnimatedHeader from "@/components/AnimatedHeader";
import CustomAlert from "@/components/CustomAlert";
import TextField from "@/components/forms/TextField";
import PageTitle from "@/components/PageTitle";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { router } from "expo-router";

const TABS = [
  { id: "profile", label: "Profile", icon: "person-outline" },
  { id: "password", label: "Password", icon: "lock-closed-outline" },
  { id: "preferences", label: "Preferences", icon: "settings-outline" },
];

const PROFILE_FIELDS = [
  { key: "fullName", label: "Full Name", placeholder: "Enter full name" },
  { key: "username", label: "Username", placeholder: "Enter username" },
  {
    key: "phoneNumber",
    label: "Phone Number",
    placeholder: "Enter phone number",
  },
  {
    key: "emailAddress",
    label: "Email Address",
    placeholder: "Enter email address",
  },
];

const PASSWORD_FIELDS = [
  {
    key: "currentPassword",
    label: "Current Password",
    placeholder: "Enter current password",
  },
  {
    key: "newPassword",
    label: "New Password",
    placeholder: "Enter new password",
  },
  {
    key: "confirmPassword",
    label: "Confirm New Password",
    placeholder: "Re-enter new password",
  },
];

const PROFILE_COPY =
  "Email changes require verification. Use the Email tab to update.";

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const { resolvedColorScheme, toggleDarkMode } = useTheme();
  const isDarkMode = resolvedColorScheme === "dark";
  const { signOut, user, authData } = useAuth();

  const [showAlert, setShowAlert] = React.useState(false);

  //  Animated scroll tracking
  const scrollY = useRef(new Animated.Value(0)).current;

  const [activeTab, setActiveTab] = useState<
    "profile" | "password" | "preferences"
  >("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [profileValues, setProfileValues] = useState({
    fullName: "Jane Doe",
    username: "janedoe",
    phoneNumber: "+1 (555) 123-4567",
    emailAddress: "jane.doe@example.com",
  });
  const [passwordValues, setPasswordValues] = useState({
    currentPassword: "Secret!123",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const styles = useMemo(
    () => createStyles(palette, colorScheme),
    [palette, colorScheme]
  );

  useEffect(() => {
    if (activeTab !== "profile" && isEditing) {
      setIsEditing(false);
    }
  }, [activeTab, isEditing]);

  useEffect(() => {
    const tm =
      (authData && (authData.teamMember || authData.user || authData.data)) ||
      null;
    setProfileValues((prev) => ({
      ...prev,
      fullName: tm?.name || user?.name || prev.fullName,
      username: tm?.userId || user?.id || prev.username,
      phoneNumber:
        tm?.phoneNumber || tm?.phone || tm?.mobile || prev.phoneNumber,
      emailAddress: tm?.email || user?.email || prev.emailAddress,
    }));
  }, [user, authData]);

  const togglePasswordVisibility = (key: keyof typeof passwordVisibility) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLogout = () => {
    setShowAlert(true); // show the custom alert
  };

  const renderProfileTab = () => (
    <>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderContent}>
          <PageTitle title={"Personal Information"} />
          <Text style={styles.sectionSubtitle}>
            Update your personal details and contact information.
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.editButton,
            isEditing && {
              backgroundColor: "transparent",
              borderWidth: 1,
              borderColor: palette.interactiveSecondary,
            },
          ]}
          onPress={() => setIsEditing((prev) => !prev)}
        >
          <Text
            style={[
              styles.editButtonText,
              isEditing && { color: palette.interactivePrimary },
            ]}
          >
            {isEditing ? "Done" : "Edit Profile"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryHeading}>Current Information</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Full Name:</Text>
            <Text style={styles.summaryValue}>
              {profileValues.fullName || "Not set"}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Username:</Text>
            <Text style={styles.summaryValue}>
              {profileValues.username || "Not set"}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Phone:</Text>
            <Text style={styles.summaryValue}>
              {profileValues.phoneNumber || "Not set"}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Email:</Text>
            <Text style={styles.summaryValue}>
              {profileValues.emailAddress || "Not set"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.formStack}>
        {PROFILE_FIELDS.map((field) => (
          <TextField
            key={field.key}
            label={field.label}
            value={profileValues[field.key as keyof typeof profileValues]}
            placeholder={field.placeholder}
            editable={isEditing}
            onChangeText={(text) =>
              setProfileValues((prev) => ({ ...prev, [field.key]: text }))
            }
            containerStyle={styles.formField}
            style={[styles.input, !isEditing && styles.readOnlyInput]}
          />
        ))}
      </View>

      <Text style={styles.helperText}>{PROFILE_COPY}</Text>
    </>
  );

  const renderPasswordTab = () => (
    <View style={styles.passwordCard}>
      <View style={styles.sectionHeader}>
        <View>
          <PageTitle title={"Change Password"} />
          <Text style={styles.sectionSubtitle}>
            Update your password to keep your account secure.
          </Text>
        </View>
      </View>

      <View style={styles.formStack}>
        {PASSWORD_FIELDS.map((field) => {
          const value =
            passwordValues[field.key as keyof typeof passwordValues];
          const visible =
            passwordVisibility[field.key as keyof typeof passwordVisibility];
          return (
            <TextField
              key={field.key}
              label={field.label}
              value={value}
              placeholder={field.placeholder}
              secureTextEntry={!visible}
              onChangeText={(text) =>
                setPasswordValues((prev) => ({ ...prev, [field.key]: text }))
              }
              containerStyle={styles.formField}
              style={styles.input}
              trailingIcon={
                <Ionicons
                  name={visible ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={palette.textSecondary}
                />
              }
              onPressTrailingIcon={() =>
                togglePasswordVisibility(
                  field.key as keyof typeof passwordVisibility
                )
              }
            />
          );
        })}
      </View>

      <TouchableOpacity style={styles.passwordButton}>
        <Text style={styles.passwordButtonText}>Update Password</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPreferencesTab = () => (
    <View style={styles.preferencesCard}>
      <View style={styles.sectionHeader}>
        <View>
          <PageTitle title={"Appearance"} />
          <Text style={styles.sectionSubtitle}>
            Customize the appearance of your application.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.preferenceRow}
        activeOpacity={0.8}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          toggleDarkMode();
        }}
      >
        <View style={styles.preferenceIcon}>
          <Ionicons name="moon-outline" size={20} color={palette.textPrimary} />
        </View>
        <View style={styles.preferenceContent}>
          <Text style={styles.preferenceTitle}>Dark Mode</Text>
          <Text style={styles.preferenceSubtitle}>
            {isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          </Text>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            toggleDarkMode();
          }}
          trackColor={{
            false: palette.mediumGray,
            true: palette.interactivePrimary,
          }}
          thumbColor={palette.accentWhite}
        />
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Account</Text>
          <Text style={styles.sectionSubtitle}>
            Manage your account settings.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.logoutRow}
        activeOpacity={0.8}
        onPress={handleLogout}
      >
        <View style={styles.logoutIcon}>
          <Ionicons
            name="log-out-outline"
            size={20}
            color={palette.statusError}
          />
        </View>
        <View style={styles.preferenceContent}>
          <Text style={styles.logoutTitle}>Logout</Text>
          <Text style={styles.preferenceSubtitle}>
            Sign out of your account
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={palette.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
      edges={["top", "left", "right"]}
    >
      {/* Scrollable content */}
      <Animated.ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        <PageTitle title={"Account Settings"} />
        <Text style={styles.pageSubtitle}>
          Manage your account information, security, and payment methods.
        </Text>

        <View style={styles.tabs}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id as typeof activeTab)}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={tab.icon as keyof typeof Ionicons.glyphMap}
                  size={18}
                  color={isActive ? palette.primary : palette.textSecondary}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isActive ? palette.primary : palette.textSecondary,
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {activeTab === "profile" && renderProfileTab()}
        {activeTab === "password" && renderPasswordTab()}
        {activeTab === "preferences" && renderPreferencesTab()}
      </Animated.ScrollView>
      <AnimatedHeader title="Account Settings" scrollY={scrollY} />

      <CustomAlert
        visible={showAlert}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await signOut();
          router.replace("/auth/login");
          setShowAlert(false);
        }}
        onCancel={() => setShowAlert(false)}
      />
    </SafeAreaView>
  );
}

const createStyles = (
  palette: (typeof Colors)["light"],
  colorScheme: "light" | "dark"
) =>
  StyleSheet.create({
    sectionHeaderContent: {
      width: "60%",
    },
    safeArea: {
      flex: 1,
    },
    container: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 32,
      gap: 24,
    },
    pageTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: palette.textPrimary,
    },
    pageSubtitle: {
      fontSize: 14,
      color: palette.textSecondary,
    },
    tabs: {
      flexDirection: "row",
      alignItems: "center",
      // gap: 12,
      marginTop: 16,
    },
    tabButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      // backgroundColor: palette.offWhite2,
      borderBottomWidth: 2,
      borderBottomColor: palette.mediumGray,
    },
    tabButtonActive: {
      // backgroundColor: palette.accentWhite,
      // shadowColor: "#000000",
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 20,
      elevation: 2,
      borderBottomWidth: 2,
      borderBottomColor: palette.interactivePrimary,
    },
    tabLabel: {
      fontSize: 14,
      fontWeight: "600",
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      gap: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: palette.textPrimary,
    },
    sectionSubtitle: {
      fontSize: 13,
      color: palette.textSecondary,
      marginTop: 4,
      lineHeight: 18,
      flexShrink: 1,
      flexWrap: "wrap",
    },
    editButton: {
      backgroundColor: palette.interactivePrimary,
      paddingHorizontal: 18,
      paddingVertical: 10,
      flexShrink: 0,
      borderWidth: 1,
      borderColor: palette.interactivePrimary,
      borderRadius: 0,
    },
    editButtonText: {
      color: palette.textInverse,
      fontSize: 14,
      fontWeight: "600",
    },
    summaryCard: {
      backgroundColor: palette.offWhite2,
      padding: 20,
      gap: 12,
    },
    summaryHeading: {
      fontSize: 15,
      fontWeight: "600",
      color: palette.textPrimary,
    },
    summaryRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      rowGap: 12,
      columnGap: 24,
    },
    summaryItem: {
      minWidth: "45%",
    },
    summaryLabel: {
      fontSize: 13,
      fontWeight: "500",
      color: palette.textSecondary,
    },
    summaryValue: {
      fontSize: 13,
      color: palette.textSecondary,
    },
    formStack: {
      gap: 18,
    },
    formField: {
      width: "100%",
    },
    input: {
      backgroundColor: palette.accentWhite,
    },
    readOnlyInput: {
      backgroundColor: palette.offWhite2,
      color: palette.textSecondary,
    },
    helperText: {
      fontSize: 13,
      color: palette.textSecondary,
    },
    passwordCard: {
      backgroundColor: palette.accentWhite,
      padding: 24,
      gap: 20,
      shadowColor: "#000000",
      shadowOpacity: 0.04,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 24,
      elevation: 2,
    },
    passwordFields: {
      gap: 18,
    },
    passwordButton: {
      backgroundColor: palette.interactivePrimary,
      paddingVertical: 14,
      alignItems: "center",
      borderWidth: 1,
      borderColor: palette.interactivePrimary,
      borderRadius: 0,
    },
    passwordButtonText: {
      color: palette.textInverse,
      fontWeight: "600",
      fontSize: 15,
    },
    preferencesCard: {
      backgroundColor: palette.accentWhite,
      padding: 24,
      gap: 12,
      shadowColor: "#000000",
      shadowOpacity: 0.04,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 24,
      elevation: 2,
    },
    preferenceRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: palette.offWhite2,
      padding: 18,
      gap: 16,
      borderWidth: 1,
      borderColor: palette.mediumGray,
    },
    preferenceIcon: {
      width: 44,
      height: 44,
      backgroundColor: palette.accentWhite,
      alignItems: "center",
      justifyContent: "center",
    },
    preferenceContent: {
      flex: 1,
      gap: 4,
    },
    preferenceTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: palette.textPrimary,
    },
    preferenceSubtitle: {
      fontSize: 13,
      color: palette.textSecondary,
    },
    preferenceSwitch: {
      justifyContent: "center",
      alignItems: "center",
    },
    switchTrack: {
      width: 46,
      height: 26,
      borderRadius: 999,
      justifyContent: "center",
      paddingHorizontal: 4,
    },
    switchThumb: {
      width: 18,
      height: 18,
      borderRadius: 9,
      alignSelf: "flex-start",
    },
    logoutRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: palette.offWhite2,
      padding: 18,
      gap: 16,
      borderWidth: 1,
      borderColor: palette.mediumGray,
    },
    logoutIcon: {
      width: 44,
      height: 44,
      backgroundColor: palette.accentWhite,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor:
        colorScheme === "dark"
          ? "rgba(220, 53, 69, 0.3)"
          : "rgba(220, 53, 69, 0.2)",
    },
    logoutTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: palette.statusError,
    },
  });
