import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AnimatedHeader from "@/components/AnimatedHeader";
import CustomAlert from "@/components/CustomAlert";
import TextField from "@/components/forms/TextField";
import PageTitle from "@/components/PageTitle";
import TripleSlider from "@/components/TripleSlider";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { baseUrl } from "@/shared/baseUrl";
import {
  useLoginMutation,
  useUpdateTeamMemberMutation,
} from "@/store/services/teamMembersApi";
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

const PROFILE_IMAGE_STORAGE_KEY = "@user_profile_image";

export default function SettingsScreen() {
  const { colorScheme, resolvedColorScheme, setColorScheme } = useTheme();
  const palette = Colors[resolvedColorScheme];
  const isDarkMode = resolvedColorScheme === "dark";
  const { signOut, user, authData } = useAuth();
  const [verifyLogin] = useLoginMutation();
  const [updateTeamMember] = useUpdateTeamMemberMutation();

  const [showAlert, setShowAlert] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);

  //  Animated scroll tracking
  const scrollY = useRef(new Animated.Value(0)).current;

  const [activeTab, setActiveTab] = useState<
    "profile" | "password" | "preferences"
  >("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [profileValues, setProfileValues] = useState({
    fullName: "",
    username: "",
    phoneNumber: "",
    emailAddress: "",
  });
  const [passwordValues, setPasswordValues] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const scrollRef = useRef<any>(null);
  const fieldPositions = useRef<Record<string, number>>({});
  const anchors = useRef<{ profile: number; preferences: number }>({
    profile: 0,
    preferences: 0,
  });
  const scrollTo = (y: number) => {
    if (!scrollRef.current) return;
    try {
      scrollRef.current.scrollTo({ y: Math.max(0, y - 24), animated: true });
    } catch {}
  };

  const styles = useMemo(
    () => createStyles(palette, resolvedColorScheme),
    [palette, resolvedColorScheme]
  );

  useEffect(() => {
    if (activeTab !== "profile" && isEditing) {
      setIsEditing(false);
    }
  }, [activeTab, isEditing]);

  useEffect(() => {
    const tm = (authData && (authData.user || authData.teamMember)) || {};
    const fullName = (user && user.name) || tm.name || "";
    const username = tm.username || tm.userId || (user && user.email) || "";
    const phoneNumber = tm.phone || "";
    const emailAddress = (user && user.email) || tm.email || "";
    setProfileValues({ fullName, username, phoneNumber, emailAddress });
  }, [user, authData]);

  // Load profile image on mount
  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        const savedImage = await AsyncStorage.getItem(
          PROFILE_IMAGE_STORAGE_KEY
        );
        if (savedImage) {
          setProfileImage(savedImage);
        }
      } catch (error) {
        console.error("Error loading profile image:", error);
      }
    };
    loadProfileImage();
  }, []);

  // Save profile image to AsyncStorage
  const saveProfileImage = async (uri: string) => {
    try {
      await AsyncStorage.setItem(PROFILE_IMAGE_STORAGE_KEY, uri);
      setProfileImage(uri);
    } catch (error) {
      console.error("Error saving profile image:", error);
      Alert.alert("Error", "Failed to save profile image");
    }
  };

  const handleImagePicker = async () => {
    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your photos"
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await saveProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const togglePasswordVisibility = (key: keyof typeof passwordVisibility) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLogout = () => {
    setShowAlert(true); // show the custom alert
  };

  const handleUpdatePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordValues;
    if (!currentPassword) {
      Alert.alert(
        "Password is required",
        "Please enter your current password."
      );
      return;
    }
    if (!newPassword) {
      Alert.alert("Password is required", "Please enter your new password.");
      return;
    }
    if (!confirmPassword) {
      Alert.alert(
        "Confirm password is required",
        "Please confirm your new password."
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Password mismatch", "New passwords do not match.");
      return;
    }
    try {
      setChangingPassword(true);
      const tm = (authData && (authData.user || authData.teamMember)) || {};
      const uid =
        tm.userId ||
        tm.username ||
        user?.email ||
        user?.id ||
        profileValues.username;
      await verifyLogin({
        userId: String(uid),
        password: currentPassword,
      }).unwrap();
      const memberId = String(tm._id || user?.id || "6938395a125676fa8ddccd65");
      const resp = await fetch(
        `${baseUrl}/api/v1/team-members/${memberId}/password`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            password: newPassword,
          }),
        }
      );
      const contentType = resp.headers.get("content-type") || "";
      let data: any = null;
      if (contentType.includes("application/json")) {
        data = await resp.json();
      } else {
        const text = await resp.text();
        data = { message: text };
      }
      if (!resp.ok) {
        const msg =
          data?.message ||
          (typeof data === "string" ? data : "Password update failed");
        throw new Error(msg);
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert("Success", "Password updated successfully.");
      setPasswordValues({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      const message =
        error?.data?.message ||
        error?.error ||
        error?.message ||
        "Password update failed";
      Alert.alert("Error", message); 
    } finally {
      setChangingPassword(false);
    }
  };

  const renderProfileTab = () => (
    <>
      {/* Profile Image Section */}
      <View style={styles.profileImageContainer}>
        <TouchableOpacity
          style={styles.profileImageWrapper}
          onPress={handleImagePicker}
          activeOpacity={0.8}
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name="person" size={48} color={palette.textSecondary} />
            </View>
          )}
          <View style={styles.profileImageEditBadge}>
            <Ionicons name="camera" size={20} color={palette.textInverse} />
          </View>
        </TouchableOpacity>
        <Text style={styles.profileImageHint}>
          Tap to change profile picture
        </Text>
      </View>

      <View
        style={styles.sectionHeader}
        onLayout={(e) => {
          anchors.current.profile = e.nativeEvent.layout.y;
        }}
      >
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
          onPress={async () => {
            const prev = isEditing;
            setIsEditing((p) => !p);
            if (prev) {
              const tm =
                (authData && (authData.user || authData.teamMember)) || {};
              const memberId = String(
                tm._id || user?.id || "6936a455d7ba9fe5f545abb8"
              );
              const name = profileValues.fullName?.trim();
              const phone = profileValues.phoneNumber?.trim();
              if (!name && !phone) {
                Alert.alert("No changes", "Update your name or phone number.");
                return;
              }
              try {
                const resp = await updateTeamMember({
                  id: memberId,
                  name,
                  phone,
                }).unwrap();
                const updated = resp?.teamMember || {};
                setProfileValues((prevVals) => ({
                  ...prevVals,
                  fullName: updated.name ?? prevVals.fullName,
                  phoneNumber: updated.phone ?? prevVals.phoneNumber,
                }));
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                Alert.alert("Success", "Profile updated successfully.");
              } catch (error: any) {
                const message =
                  error?.data?.message ||
                  error?.error ||
                  error?.message ||
                  "Profile update failed";
                Alert.alert("Error", message);
              }
            }
          }}
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
          <View
            key={field.key}
            onLayout={(e) => {
              fieldPositions.current[field.key] = e.nativeEvent.layout.y;
            }}
          >
            <TextField
              label={field.label}
              value={profileValues[field.key as keyof typeof profileValues]}
              placeholder={field.placeholder}
              editable={
                field.key === "username" || field.key === "emailAddress"
                  ? false
                  : isEditing
              }
              onChangeText={(text) =>
                setProfileValues((prev) => ({ ...prev, [field.key]: text }))
              }
              containerStyle={styles.formField}
              style={[
                styles.input,
                (field.key === "username" ||
                  field.key === "emailAddress" ||
                  !isEditing) &&
                  styles.readOnlyInput,
              ]}
              onFocus={() => {
                const y = fieldPositions.current[field.key];
                if (typeof y === "number") scrollTo(y);
              }}
            />
          </View>
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

      <TouchableOpacity
        style={styles.passwordButton}
        onPress={handleUpdatePassword}
        disabled={changingPassword}
        activeOpacity={0.8}
      >
        {changingPassword ? (
          <Text style={styles.passwordButtonText}>Updating...</Text>
        ) : (
          <Text style={styles.passwordButtonText}>Update Password</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderPreferencesTab = () => {
    return (
      <View
        style={styles.preferencesCard}
        onLayout={(e) => {
          anchors.current.preferences = e.nativeEvent.layout.y;
        }}
      >
        <View style={styles.sectionHeader}>
          <View>
            <PageTitle title={"Appearance"} />
            <Text style={styles.sectionSubtitle}>
              Customize the appearance of your application.
            </Text>
          </View>
        </View>
        <View style={styles.themeSliderContainer}>
          <TripleSlider
            value={colorScheme}
            onValueChange={(value) => {
              setColorScheme(value);
            }}
            labels={["Light", "Auto", "Dark"]}
          />
        </View>

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
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
      edges={["top", "left", "right"]}
    >
      {/* Scrollable content */}
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Animated.ScrollView
          ref={scrollRef}
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          keyboardShouldPersistTaps="handled"
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
                  onPress={() => {
                    setActiveTab(tab.id as typeof activeTab);
                    const y =
                      tab.id === "profile"
                        ? anchors.current.profile
                        : tab.id === "preferences"
                        ? anchors.current.preferences
                        : 0;
                    if (typeof y === "number") {
                      setTimeout(() => scrollTo(y), 0);
                    }
                  }}
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
                        color: isActive
                          ? palette.primary
                          : palette.textSecondary,
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
      </KeyboardAvoidingView>
      <AnimatedHeader title="Account Settings" scrollY={scrollY} />

      <CustomAlert
        visible={showAlert}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        confirmLoading={loggingOut}
        onConfirm={async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          try {
            setLoggingOut(true);
            await signOut();
            setShowAlert(false);
            // Dismiss all modals and reset navigation stack
            router.dismissAll();
            router.replace("/auth/login");
          } finally {
            setLoggingOut(false);
          }
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
    profileImageContainer: {
      alignItems: "center",
      marginBottom: 24,
      gap: 12,
    },
    profileImageWrapper: {
      position: "relative",
      width: 120,
      height: 120,
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: palette.offWhite2,
    },
    profileImagePlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: palette.offWhite2,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: palette.mediumGray,
    },
    profileImageEditBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: palette.interactivePrimary,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: palette.background,
    },
    profileImageHint: {
      fontSize: 13,
      color: palette.textSecondary,
      textAlign: "center",
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
    themeSliderContainer: {
      paddingVertical: 20,
      alignItems: "center",
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
