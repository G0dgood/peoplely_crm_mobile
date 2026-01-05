import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useGetStatusesByLineOfBusinessQuery } from "@/store/services/teamMembersApi";
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

interface StatusBadgeProps {
  currentStatus: string;
  onStatusSelect: (statusId: string) => void;
}

export default function StatusBadge({
  currentStatus,
  onStatusSelect,
}: StatusBadgeProps) {
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

  const { data: statusesData } = useGetStatusesByLineOfBusinessQuery(
    "693806b15eb41d3dbd71d442"
  );
  const apiStatuses =
    (statusesData?.statuses || []).map((s: any) => ({
      id: String(s?.statusId || s?._id || s?.name || ""),
      label: String(s?.name || ""),
      colorHex: s?.color as string | undefined,
    })) || [];
  const status = apiStatuses.find((s: any) => s.id === currentStatus);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Reset menu width when opening
    setMenuWidth(200);
    // Measure badge position in window coordinates before showing menu
    badgeRef.current?.measureInWindow(
      (x: number, y: number, width: number, height: number) => {
        setBadgeLayout({
          x,
          y,
          width,
          height,
        });
        setShowMenu(true);
      }
    );
  };

  const handleStatusSelect = (statusId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onStatusSelect(statusId);
    setShowMenu(false);
  };

  const handleMenuItemLayout = (event: {
    nativeEvent: { layout: { width: number } };
  }) => {
    const { width } = event.nativeEvent.layout;
    setMenuWidth((prevWidth) => Math.max(prevWidth, width));
  };

  return (
    <>
      <View ref={badgeRef} collapsable={false}>
        <TouchableOpacity
          style={styles.statusBadge}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: status?.colorHex || palette.statusSuccess,
              },
            ]}
          />
          <View style={styles.textContainer}>
            <Text
              style={[styles.statusBadgeText, { color: palette.textPrimary }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {status?.label || ""}
            </Text>
          </View>
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
          {badgeLayout &&
            (() => {
              const calculatedWidth = menuWidth > 250 ? menuWidth : 208;
              const menuLeft =
                badgeLayout.x + badgeLayout.width - calculatedWidth;
              return (
                <View
                  style={[
                    styles.menuContainer,
                    {
                      backgroundColor: palette.accentWhite,
                      borderColor: palette.mediumGray,
                      shadowColor: palette.shadowColor,
                      position: "absolute",
                      top: badgeLayout.y + badgeLayout.height + 4,
                      left: menuLeft,
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
                      {apiStatuses.map((option: any) => {
                        const isSelected = currentStatus === option.id;
                        const optionColor =
                          option.colorHex || palette.statusSuccess;
                        return (
                          <TouchableOpacity
                            key={option.id}
                            style={[
                              styles.menuItem,
                              isSelected && {
                                backgroundColor: palette.offWhite2,
                              },
                            ]}
                            onPress={() => handleStatusSelect(option.id)}
                            activeOpacity={0.7}
                          >
                            <View
                              style={[
                                styles.menuItemDot,
                                { backgroundColor: optionColor },
                              ]}
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
              );
            })()}
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const createStyles = (palette: (typeof Colors)["light"]) =>
  StyleSheet.create({
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 0,
      backgroundColor: palette.bgSecondary,
      gap: 8,
      maxWidth: 150,
      minWidth: 140,
      height: 36,
    },
    statusDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: palette.accentWhite,
    },
    textContainer: {
      flex: 1,
      flexShrink: 1,
      minWidth: 0,
      maxWidth: 120,
    },
    statusBadgeText: {
      fontSize: 12,
      fontWeight: "500",
      maxWidth: 120,
    },
    chevronIcon: {
      marginLeft: 0,
      flexShrink: 0,
      width: 14,
    },
    menuOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
    },
    menuContainer: {
      minWidth: 200,
      borderWidth: 1,
      paddingVertical: 4,
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
    menuItemDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: palette.accentWhite,
    },
    menuItemText: {
      fontSize: 14,
      fontWeight: "500",
      flex: 1,
      flexShrink: 1,
    },
  });
