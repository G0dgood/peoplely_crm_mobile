import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import TextField from "@/components/forms/TextField";

interface DispositionDateTimeFieldProps {
  field: any;
  fieldKey: string;
  value?: any; // For 'date' or 'time' types
  dateValue?: any; // For 'date-time' type
  timeValue?: any; // For 'date-time' type
  onOpenPicker: (key: string) => void;
  palette: any;
}

const DispositionDateTimeField: React.FC<DispositionDateTimeFieldProps> = ({
  field,
  fieldKey,
  value,
  dateValue,
  timeValue,
  onOpenPicker,
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

  if (field.type === "date-time" || field.fieldType === "date-time") {
    return (
      <View key={field.id || field._id} style={{ marginBottom: 16 }}>
        <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>
          {field.name}
        </Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onOpenPicker(`${fieldKey}_date`);
            }}
            activeOpacity={0.7}
          >
            <TextField
              label="Date"
              placeholder="dd/mm/yyyy"
              value={
                dateValue instanceof Date
                  ? dateValue.toLocaleDateString("en-GB")
                  : dateValue || ""
              }
              editable={false}
              trailingIcon={
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={palette.textSecondary}
                />
              }
              onPressTrailingIcon={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onOpenPicker(`${fieldKey}_date`);
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onOpenPicker(`${fieldKey}_time`);
            }}
            activeOpacity={0.7}
          >
            <TextField
              label="Time"
              placeholder="--:--"
              value={
                timeValue instanceof Date
                  ? timeValue.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })
                  : timeValue || ""
              }
              editable={false}
              trailingIcon={
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={palette.textSecondary}
                />
              }
              onPressTrailingIcon={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onOpenPicker(`${fieldKey}_time`);
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Handle single 'date' or 'time'
  const isTime = field.type === "time" || field.fieldType === "time";
  return (
    <View key={field.id || field._id}>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onOpenPicker(fieldKey);
        }}
        activeOpacity={0.7}
      >
        <TextField
          label={field.name}
          placeholder={isTime ? "--:--" : "dd/mm/yyyy"}
          value={
            value instanceof Date
              ? isTime
                ? value.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })
                : value.toLocaleDateString("en-GB")
              : value || ""
          }
          editable={false}
          trailingIcon={
            <Ionicons
              name={isTime ? "time-outline" : "calendar-outline"}
              size={20}
              color={palette.textSecondary}
            />
          }
          onPressTrailingIcon={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onOpenPicker(fieldKey);
          }}
        />
      </TouchableOpacity>
    </View>
  );
};

export default DispositionDateTimeField;
