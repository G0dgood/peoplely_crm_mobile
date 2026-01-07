import TextField from "@/components/forms/TextField";
import React from "react";

interface DispositionTextFieldProps {
  field: any;
  value: string;
  onChange: (text: string) => void;
}

const DispositionTextField: React.FC<DispositionTextFieldProps> = ({
  field,
  value,
  onChange,
}) => {
  if (field.type === "textarea" || field.fieldType === "multi-line-text") {
    return (
      <TextField
        key={field.id || field._id}
        label={field.name}
        multiline
        numberOfLines={4}
        placeholder={`Enter ${field.name}`}
        style={{ height: 120, textAlignVertical: "top" }}
        value={value}
        onChangeText={onChange}
      />
    );
  }

  return (
    <TextField
      key={field.id || field._id}
      label={field.name}
      placeholder={`Enter ${field.name}`}
      value={value}
      onChangeText={onChange}
      keyboardType={
        field.type === "number" ||
          field.fieldType === "number" ||
          field.fieldType === "phone"
          ? "numeric"
          : "default"
      }
    />
  );
};

export default DispositionTextField;
