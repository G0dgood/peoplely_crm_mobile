import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { createModalStyles } from "./shared";

const WIDGET_STORAGE_KEY = "@dashboard_selected_widgets";

export type WidgetType = "bar" | "line" | "pie" | "doughnut" | "polarArea" | "radar" | "scatter" | "bubble";

export interface Widget {
  id: string;
  type: WidgetType;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

export const AVAILABLE_WIDGETS: Widget[] = [
  {
    id: "bar-chart",
    type: "bar",
    name: "Bar Chart",
    icon: "bar-chart-outline",
    description: "Display data as vertical bars",
  },
  {
    id: "line-chart",
    type: "line",
    name: "Line Chart",
    icon: "trending-up-outline",
    description: "Display data as a line graph",
  },
  {
    id: "pie-chart",
    type: "pie",
    name: "Pie Chart",
    icon: "pie-chart-outline",
    description: "Display data as pie slices",
  },
  {
    id: "doughnut-chart",
    type: "doughnut",
    name: "Doughnut Chart",
    icon: "disc-outline",
    description: "Display data as a doughnut chart",
  },
  {
    id: "polar-area-chart",
    type: "polarArea",
    name: "Polar Area Chart",
    icon: "radio-button-on-outline",
    description: "Display data in polar area format",
  },
  {
    id: "radar-chart",
    type: "radar",
    name: "Radar Chart",
    icon: "navigate-outline",
    description: "Display data as a radar/spider chart",
  },
  {
    id: "scatter-chart",
    type: "scatter",
    name: "Scatter Chart",
    icon: "ellipse-outline",
    description: "Display data as scatter points",
  },
  {
    id: "bubble-chart",
    type: "bubble",
    name: "Bubble Chart",
    icon: "radio-button-off-outline",
    description: "Display data as bubbles",
  },
];

const createStyles = (palette: typeof Colors.light) =>
  StyleSheet.create({
    ...createModalStyles(palette),
    subtitle: {
      fontSize: 14,
      color: palette.textSecondary,
      marginTop: 4,
    },
    widgetList: {
      gap: 12,
      marginTop: 8,
    },
    widgetItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      backgroundColor: palette.offWhite,
      borderWidth: 1,
      borderColor: palette.mediumGray,
      borderRadius: 0,
    },
    widgetItemSelected: {
      backgroundColor: palette.offWhite2,
      borderColor: palette.interactivePrimary,
      borderWidth: 2,
    },
    widgetIcon: {
      width: 40,
      height: 40,
      borderRadius: 0,
      backgroundColor: palette.bgSecondary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    widgetInfo: {
      flex: 1,
    },
    widgetName: {
      fontSize: 16,
      fontWeight: "600",
      color: palette.textPrimary,
      marginBottom: 4,
    },
    widgetDescription: {
      fontSize: 12,
      color: palette.textSecondary,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 0,
      borderWidth: 2,
      borderColor: palette.mediumGray,
      justifyContent: "center",
      alignItems: "center",
    },
    checkboxSelected: {
      backgroundColor: palette.interactivePrimary,
      borderColor: palette.interactivePrimary,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 12,
      marginTop: 20,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: palette.mediumGray,
    },
    cancelButton: {
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 0,
      borderWidth: 1,
      borderColor: palette.mediumGray,
      backgroundColor: palette.accentWhite,
    },
    cancelButtonText: {
      color: palette.textPrimary,
      fontSize: 14,
      fontWeight: "600",
    },
    addButton: {
      backgroundColor: palette.interactivePrimary,
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 0,
      borderWidth: 1,
      borderColor: palette.interactivePrimary,
    },
    addButtonText: {
      color: palette.textInverse,
      fontSize: 14,
      fontWeight: "600",
    },
  });

export default function AddWidgetModal() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = useMemo(() => createStyles(palette), [palette]);

  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load current selected widgets
  useEffect(() => {
    const loadWidgets = async () => {
      try {
        const saved = await AsyncStorage.getItem(WIDGET_STORAGE_KEY);
        if (saved) {
          setSelectedWidgets(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Error loading widgets:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadWidgets();
  }, []);

  const toggleWidget = (widgetId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedWidgets((prev) => {
      if (prev.includes(widgetId)) {
        return prev.filter((id) => id !== widgetId);
      } else {
        return [...prev, widgetId];
      }
    });
  };

  const handleAdd = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await AsyncStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(selectedWidgets));
      router.back();
    } catch (error) {
      console.error("Error saving widgets:", error);
      router.back();
    }
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: "rgba(0,0,0,0.4)" }]}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.container, { backgroundColor: palette.accentWhite }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCancel}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={18} color={palette.textPrimary} />
          </TouchableOpacity>
          <View style={styles.header}>
            <Text style={styles.title}>Add Widget</Text>
            <Text style={styles.subtitle}>
              Select charts to add to your dashboard
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.widgetList}
            showsVerticalScrollIndicator={false}
          >
            {AVAILABLE_WIDGETS.map((widget) => {
              const isSelected = selectedWidgets.includes(widget.id);
              return (
                <TouchableOpacity
                  key={widget.id}
                  style={[
                    styles.widgetItem,
                    isSelected && styles.widgetItemSelected,
                  ]}
                  onPress={() => toggleWidget(widget.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.widgetIcon}>
                    <Ionicons
                      name={widget.icon}
                      size={20}
                      color={palette.interactivePrimary}
                    />
                  </View>
                  <View style={styles.widgetInfo}>
                    <Text style={styles.widgetName}>{widget.name}</Text>
                    <Text style={styles.widgetDescription}>{widget.description}</Text>
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected,
                    ]}
                  >
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={palette.textInverse}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAdd}
              activeOpacity={0.7}
            >
              <Text style={styles.addButtonText}>
                Add {selectedWidgets.length > 0 ? `(${selectedWidgets.length})` : ""}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

