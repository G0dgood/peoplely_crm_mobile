import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DispositionCheckboxFieldProps {
  field: any;
  value: string[];
  onChange: (value: string[]) => void;
  palette: any;
}

const DispositionCheckboxField: React.FC<DispositionCheckboxFieldProps> = ({
  field,
  value,
  onChange,
  palette,
}) => {
  const styles = StyleSheet.create({
    fieldLabel: {
      fontSize: 14,
      fontWeight: "500",
      marginBottom: 8,
      marginLeft: 4,
    },
  });

  const options = field.dropdownOptions || field.options || [];

  return (
    <View key={field.id || field._id} style={{ marginBottom: 16 }}>
      <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>
        {field.name}
      </Text>
      <View style={{ gap: 8 }}>
        {options.map((option: string) => {
          const isSelected = Array.isArray(value) && value.includes(option);
          return (
            <TouchableOpacity
              key={option}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 8,
              }}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                const newValue = isSelected
                  ? value.filter((v: string) => v !== option)
                  : [...(value || []), option];
                onChange(newValue);
              }}
            >
              <Ionicons
                name={isSelected ? "checkbox" : "square-outline"}
                size={22}
                color={
                  isSelected
                    ? palette.interactivePrimary
                    : palette.textSecondary
                }
              />
              <Text
                style={{
                  marginLeft: 10,
                  color: palette.textPrimary,
                  fontSize: 16,
                }}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default DispositionCheckboxField;
