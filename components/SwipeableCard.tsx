import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { windowWidth } from "@/utils/Dimentions";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";

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
}

export default function SwipeableCard({ cards, onAddWidget }: SwipeableCardProps) {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];
	const styles = React.useMemo(() => createStyles(palette), [palette]);
	const [activeCardIndex, setActiveCardIndex] = useState(0);
	const [isValueVisible, setIsValueVisible] = useState(true);


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

	const handleToggleVisibility = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		setIsValueVisible(!isValueVisible);
	};

	const renderCard = ({ item: card }: { item: CardData }) => (
		<View style={styles.balanceCard}>
			<View style={styles.balanceHeader}>
				<View style={styles.balanceHeaderLeft}>
					<Ionicons
						name={card.icon as any}
						size={18}
						color={card.color}
					/>
					<Text
						style={[
							styles.balanceLabel,
							{ color: palette.primaryLighter },
						]}
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
			<Text
				style={[styles.balanceValue, { color: palette.textPrimary }]}
			>
				{card.type === "total" && !isValueVisible
					? "••••"
					: card.value}
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

			{/* Carousel Dots */}
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

			{/* Add Widget Button */}
			<TouchableOpacity
				style={styles.primaryButton}
				onPress={handleAddWidget}
			>
				<Ionicons name="add-outline" size={18} color={palette.textInverse} />
				<Text style={styles.primaryButtonText}>Add widget</Text>
			</TouchableOpacity>
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
			backgroundColor: palette.interactivePrimary,
			paddingVertical: 16,
		},
		primaryButtonText: {
			fontSize: 16,
			fontWeight: "600",
			color: palette.textInverse,
		},
	});

