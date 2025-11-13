import React, { ReactNode, useMemo, useState } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type TextFieldProps = TextInputProps & {
  label: string;
  description?: string;
  trailingIcon?: ReactNode;
  onPressTrailingIcon?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
};

const TextField: React.FC<TextFieldProps> = ({
  label,
  description,
  trailingIcon,
  onPressTrailingIcon,
  containerStyle,
  style,
  ...textInputProps
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            trailingIcon ? styles.inputWithIcon : styles.inputWithoutIcon,
            style,
            isFocused ? styles.inputFocused : null,
          ]}
          placeholderTextColor={palette.primaryLighter}
          onFocus={(event) => {
            setIsFocused(true);
            textInputProps.onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            textInputProps.onBlur?.(event);
          }}
          {...textInputProps}
        />

        {trailingIcon ? (
          <TouchableOpacity
            onPress={onPressTrailingIcon}
            disabled={!onPressTrailingIcon}
            style={styles.trailingIcon}
            activeOpacity={0.7}
          >
            {trailingIcon}
          </TouchableOpacity>
        ) : null}
      </View>

      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
};

const createStyles = (palette: (typeof Colors)["light"]) =>
  StyleSheet.create({
    container: {
      gap: 10,
    },
    label: {
      fontSize: 14,
      fontFamily: "Poppins-Medium",
      color: palette.textPrimary,
    },
    inputWrapper: {
      position: "relative",
      justifyContent: "center",
    },
    input: {
      height: 48,
      borderWidth: 1,
      borderColor: palette.mediumGray,
      fontSize: 16,
      color: palette.textPrimary,
      backgroundColor: palette.accentWhite,
    },
    inputFocused: {
      borderColor: palette.interactivePrimary,
      shadowColor: palette.shadowColor,
      shadowOpacity: 0.12,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 10,
      elevation: 2,
    },
    inputWithIcon: {
      paddingHorizontal: 16,
      paddingRight: 48,
    },
    inputWithoutIcon: {
      paddingHorizontal: 16,
    },
    trailingIcon: {
      position: "absolute",
      right: 12,
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    description: {
      fontSize: 12,
      fontFamily: "Poppins-Regular",
      color: palette.textSecondary,
    },
  });

export default TextField;

