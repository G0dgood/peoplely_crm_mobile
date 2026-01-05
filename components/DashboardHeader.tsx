import StatusBadge from "@/components/StatusBadge";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

const PROFILE_IMAGE_STORAGE_KEY = "@user_profile_image";

interface DashboardHeaderProps {
  userName?: string;
  currentStatus: string;
  onStatusPress: (statusId: string) => void;
  notificationCount?: number;
}

export default function DashboardHeader({
  userName,
  currentStatus,
  onStatusPress,
  notificationCount = 0,
}: DashboardHeaderProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = React.useMemo(() => createStyles(palette), [palette]);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Load profile image on mount and when screen comes into focus
  const loadProfileImage = useCallback(async () => {
    try {
      const savedImage = await AsyncStorage.getItem(PROFILE_IMAGE_STORAGE_KEY);
      if (savedImage) {
        setProfileImage(savedImage);
      } else {
        setProfileImage(null);
      }
    } catch (error) {
      console.error("Error loading profile image:", error);
    }
  }, []);

  useEffect(() => {
    loadProfileImage();
  }, [loadProfileImage]);

  useFocusEffect(
    useCallback(() => {
      loadProfileImage();
    }, [loadProfileImage])
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <View style={styles.headerRow}>
      <View style={styles.headerMeta}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Ionicons name="person" size={14} color={palette.textSecondary} />
          </View>
        )}
        <View>
          <Text style={[styles.headerText, { color: palette.textSecondary }]}>
            {getGreeting()}
          </Text>
          {userName && (
            <Text style={[styles.userName, { color: palette.textPrimary }]}>
              {userName}
            </Text>
          )}
        </View>
      </View>
      <StatusBadge
        currentStatus={currentStatus}
        onStatusSelect={onStatusPress}
      />
    </View>
  );
}

const createStyles = (palette: (typeof Colors)["light"]) =>
  StyleSheet.create({
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    headerMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    profileImage: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: palette.offWhite2,
      borderWidth: 2,
      borderColor: palette.mediumGray,
    },
    profileImagePlaceholder: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: palette.offWhite2,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: palette.mediumGray,
    },
    headerText: {
      fontSize: 16,
      fontWeight: "500",
    },
    userName: {
      fontSize: 14,
      fontWeight: "600",
      marginTop: 2,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
    },
  });
