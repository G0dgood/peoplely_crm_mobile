import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { windowWidth } from "@/utils/Dimentions";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import FilterDropdown, { FilterPreset } from "./FilterDropdown";

export interface CardData {
  type: string;
  label: string;
  value: string;
  icon: string;
  color: string;
}

interface SwipeableCardProps {
  cards: CardData[];
  onAddWidget?: () => void;
  onFilterPress?: () => void; // ← NEW: callback for opening filter dropdown
}

export default function SwipeableCard({
  cards,
  onAddWidget,
  onFilterPress, // ← NEW prop
}: SwipeableCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = React.useMemo(() => createStyles(palette), [palette]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isValueVisible, setIsValueVisible] = useState(true);
  const [dateFilter, setDateFilter] = useState<FilterPreset>("this-month");

  const handleSnapToItem = (index: number) => {
    if (index !== activeCardIndex) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setActiveCardIndex(index);
    }
  };

  const handleAddWidget = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onAddWidget) {
      onAddWidget();
    } else {
      router.push("/modal/add-widget");
    }
  };

  const handleFilterPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onFilterPress) {
      onFilterPress();
    }
    // You can later replace the above with opening your StatusBadge-like filter dropdown
  };

  const handleToggleVisibility = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsValueVisible(!isValueVisible);
  };

  const renderCard = ({ item: card }: { item: CardData }) => (
    <View style={styles.balanceCard}>
      <View style={styles.balanceHeader}>
        <View style={styles.balanceHeaderLeft}>
          <Ionicons name={card.icon as any} size={18} color={card.color} />
          <Text
            style={[styles.balanceLabel, { color: palette.primaryLighter }]}
          >
            {card.label}
          </Text>
        </View>
        {card.type === "total" && (
          <TouchableOpacity
            onPress={handleToggleVisibility}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isValueVisible ? "eye-outline" : "eye-off-outline"}
              size={18}
              color={palette.primaryLighter}
            />
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.balanceValue, { color: palette.textPrimary }]}>
        {card.type === "total" && !isValueVisible ? "••••" : card.value}
      </Text>
    </View>
  );

  return (
    <>
      {/* Swipeable Cards */}
      <Carousel
        height={140}
        data={cards}
        renderItem={renderCard}
        onSnapToItem={handleSnapToItem}
        loop={false}
        snapEnabled={true}
        width={windowWidth * 0.9}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 40,
        }}
      />

      {/* Carousel Dots + Filter Button (replaces Add Widget) */}
      <View style={styles.carouselDotsContainer}>
        <View style={styles.carouselDots}>
          {cards.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeCardIndex === index && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Filter Button – same size/style as old Add Widget button */}
        <FilterDropdown
          currentFilter={dateFilter}
          onFilterChange={setDateFilter}
          buttonStyle={styles.primaryButton} // reuses your blue button look
          onCustomPress={() => {
            /* open date picker */
          }}
        />
      </View>
    </>
  );
}

const createStyles = (palette: (typeof Colors)["light"]) =>
  StyleSheet.create({
    balanceCard: {
      padding: 24,
      backgroundColor: palette.accentWhite,
      shadowColor: palette.shadowColor,
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 16 },
      shadowRadius: 32,
      elevation: 6,
      borderColor: palette.mediumGray,
      borderWidth: 1,
    },
    balanceHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    balanceHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    balanceLabel: {
      fontSize: 14,
      fontWeight: "500",
    },
    balanceValue: {
      fontSize: 40,
      fontWeight: "700",
      letterSpacing: -0.5,
      marginBottom: 16,
    },
    gainRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    gainLabel: {
      fontSize: 14,
    },
    gainChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: palette.interactiveHover,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    gainValue: {
      color: palette.statusSuccess,
      fontWeight: "600",
      fontSize: 14,
    },
    carouselDots: {
      flexDirection: "row",
      gap: 6,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 999,
      backgroundColor: palette.mediumGray,
    },
    dotActive: {
      width: 18,
      backgroundColor: palette.interactivePrimary,
    },
    primaryButton: {
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: palette.bgSecondary,
      paddingVertical: 0,
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: palette.textInverse,
    },
    carouselDotsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
    },
  });
