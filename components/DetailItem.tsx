import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/theme";

type DetailItemProps = {
  label: string;
  value: string;
  styles: {
    item: any;
    label: any;
    value: any;
  };
};

export const DetailItem: React.FC<DetailItemProps> = ({ label, value, styles }) => (
  <View style={styles.item}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);
