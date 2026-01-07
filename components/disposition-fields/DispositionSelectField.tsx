import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";

import TextField from "@/components/forms/TextField";
import SelectionModal from "@/components/SelectionModal";

interface DispositionSelectFieldProps {
  field: any;
  value: string;
  onChange: (value: string) => void;
  palette: any;
}

const DispositionSelectField: React.FC<DispositionSelectFieldProps> = ({
  field,
  value,
  onChange,
  palette,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const options = field.dropdownOptions || field.options || [];

  return (
    <View key={field.id || field._id}>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setModalVisible(true);
        }}
        activeOpacity={0.7}
      >
        <TextField
          label={field.name}
          placeholder="Select"
          editable={false}
          value={value}
          trailingIcon={
            <Ionicons
              name="chevron-down"
              size={20}
              color={palette.textSecondary}
            />
          }
          onPressTrailingIcon={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setModalVisible(true);
          }}
        />
      </TouchableOpacity>

      <SelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={`Select ${field.name}`}
        options={options.map((opt: string) => ({ label: opt, value: opt }))}
        selectedValue={value}
        onSelect={onChange}
        palette={palette}
      />
    </View>
  );
};

export default DispositionSelectField;
