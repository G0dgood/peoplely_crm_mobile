import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DispositionRadioFieldProps {
  field: any;
  value: string;
  onChange: (value: string) => void;
  palette: any;
}

const DispositionRadioField: React.FC<DispositionRadioFieldProps> = ({
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
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {options.map((option: string) => (
          <TouchableOpacity
            key={option}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor:
                value === option
                  ? palette.interactivePrimary
                  : palette.mediumGray,
              backgroundColor:
                value === option ? palette.offWhite2 : "transparent",
            }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onChange(option);
            }}
          >
            <Ionicons
              name={value === option ? "radio-button-on" : "radio-button-off"}
              size={20}
              color={
                value === option
                  ? palette.interactivePrimary
                  : palette.textSecondary
              }
            />
            <Text style={{ marginLeft: 8, color: palette.textPrimary }}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default DispositionRadioField;
