import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useRef, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Define common date filter presets
export type FilterPreset =
  | "today"
  | "yesterday"
  | "this-week"
  | "this-month"
  | "last-7-days"
  | "last-30-days"
  | "last-90-days"
  | "custom";

export interface FilterOption {
  id: FilterPreset;
  label: string;
  // You can compute start/end dates in the parent component based on id
}

interface FilterDropdownProps {
  currentFilter: FilterPreset;
  onFilterChange: (preset: FilterPreset) => void;
  onCustomPress?: () => void; // Optional: open date range picker
  buttonStyle?: object;
}

export default function DateFilterDropdown({
  currentFilter,
  onFilterChange,
  onCustomPress,
  buttonStyle,
}: FilterDropdownProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = useMemo(() => createStyles(palette), [palette]);

  const [showMenu, setShowMenu] = useState(false);
  const [badgeLayout, setBadgeLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [menuWidth, setMenuWidth] = useState<number>(200);

  const badgeRef = useRef<View>(null);

  // Common date presets – you can expand this list
  const dateOptions: { id: FilterPreset; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "yesterday", label: "Yesterday" },
    { id: "this-week", label: "This Week" },
    { id: "this-month", label: "This Month" },
    { id: "last-7-days", label: "Last 7 Days" },
    { id: "last-30-days", label: "Last 30 Days" },
    { id: "custom", label: "Custom Range..." },
  ];

  const selectedOption = dateOptions.find((opt) => opt.id === currentFilter);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMenuWidth(200);

    badgeRef.current?.measureInWindow((x, y, width, height) => {
      setBadgeLayout({ x, y, width, height });
      setShowMenu(true);
    });
  };

  const handleSelect = (preset: FilterPreset) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (preset === "custom") {
      onCustomPress?.(); // Trigger your date range picker here
      setShowMenu(false);
    } else {
      onFilterChange(preset);
      setShowMenu(false);
    }
  };

  const handleMenuItemLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setMenuWidth((prev) => Math.max(prev, width));
  };

  return (
    <>
      <View ref={badgeRef} collapsable={false}>
        <TouchableOpacity
          style={[styles.filterButton, buttonStyle]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          {/* Optional: small calendar icon instead of dot */}
          <Ionicons
            name="calendar-outline"
            size={16}
            color={palette.primaryLighter}
            style={{ marginRight: 6 }}
          />

          <Text
            style={[styles.filterText, { color: palette.textPrimary }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {selectedOption?.label || "Select period"}
          </Text>

          <Ionicons
            name="chevron-down"
            size={14}
            color={palette.textSecondary}
            style={styles.chevronIcon}
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          {badgeLayout && (
            <View
              style={[
                styles.menuContainer,
                {
                  backgroundColor: palette.accentWhite,
                  borderColor: palette.mediumGray,
                  position: "absolute",
                  top: badgeLayout.y + badgeLayout.height + 4,
                  left: badgeLayout.x + badgeLayout.width - menuWidth,
                  width: menuWidth > 200 ? menuWidth : undefined,
                  minWidth: 200,
                  maxHeight: 350,
                },
              ]}
            >
              <ScrollView
                style={styles.menuScrollView}
                nestedScrollEnabled
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.menuContentContainer}
              >
                <View onLayout={handleMenuItemLayout}>
                  {dateOptions.map((option) => {
                    const isSelected = currentFilter === option.id;
                    return (
                      <TouchableOpacity
                        key={option.id}
                        style={[
                          styles.menuItem,
                          isSelected && { backgroundColor: palette.offWhite2 },
                        ]}
                        onPress={() => handleSelect(option.id as FilterPreset)}
                        activeOpacity={0.7}
                      >
                        {/* Optional: calendar icon in menu */}
                        <Ionicons
                          name="calendar-outline"
                          size={18}
                          color={palette.primaryLighter}
                        />

                        <Text
                          style={[
                            styles.menuItemText,
                            { color: palette.textPrimary },
                          ]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {option.label}
                        </Text>

                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={18}
                            color={palette.interactivePrimary}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const createStyles = (palette: (typeof Colors)["light"]) =>
  StyleSheet.create({
    filterButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      //   paddingVertical: 2,
      borderRadius: 0,
      backgroundColor: palette.bgSecondary,
      //   gap: 8,
      minWidth: 140,
      maxWidth: 220,
      height: 40,
    },
    filterText: {
      fontSize: 14,
      fontWeight: "500",
      flex: 1,
      flexShrink: 1,
    },
    chevronIcon: {
      marginLeft: 4,
      flexShrink: 0,
    },
    menuOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
    },
    menuContainer: {
      borderWidth: 1,
      paddingVertical: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
    menuScrollView: {
      maxHeight: 300,
    },
    menuContentContainer: {
      flexGrow: 0,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    menuItemText: {
      fontSize: 14,
      fontWeight: "500",
      flex: 1,
      flexShrink: 1,
    },
  });
