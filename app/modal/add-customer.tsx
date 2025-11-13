import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TextField from "@/components/forms/TextField";
import PageTitle from "@/components/PageTitle";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { createModalStyles } from "./shared";

export default function AddCustomerModal() {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];
	const styles = useMemo(() => createModalStyles(palette), [palette]);

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: "rgba(0,0,0,0.4)" }]}
			edges={["top", "left", "right"]}
		>
			<KeyboardAvoidingView
				style={styles.flex}
				behavior={Platform.OS === "ios" ? "padding" : undefined}
			>
				<View style={[styles.container, { backgroundColor: palette.accentWhite }]}
				>
					<TouchableOpacity
						style={styles.closeButton}
						onPress={() => router.back()}
						activeOpacity={0.7}
					>
						<Ionicons name="close" size={18} color={palette.textPrimary} />
					</TouchableOpacity>
					<View style={styles.header}>
						<PageTitle title="Add Customer" />
					</View>

					<ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
						<TextField
							label="First Name"
							value={firstName}
							onChangeText={setFirstName}
							placeholder="Enter First Name"
							autoCapitalize="words"
							autoFocus
						/>
						<TextField
							label="Last Name"
							value={lastName}
							onChangeText={setLastName}
							placeholder="Enter Last Name"
							autoCapitalize="words"
						/>
						<TextField
							label="Email Address"
							value={email}
							onChangeText={setEmail}
							placeholder="Enter Email"
							keyboardType="email-address"
							autoCapitalize="none"
						/>
						<TextField
							label="Mobile"
							value={phone}
							onChangeText={setPhone}
							placeholder="Enter Mobile Number"
							keyboardType="phone-pad"
						/>
					</ScrollView>

					<View style={styles.footer}>
						<TouchableOpacity activeOpacity={0.7}>
							<Text style={styles.addFields}>Add Fields</Text>
						</TouchableOpacity>
						<View style={styles.footerActions}>
							<TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
								<Text style={styles.cancel}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.saveButton} activeOpacity={0.7}>
								<Text style={styles.saveButtonText}>Save</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
