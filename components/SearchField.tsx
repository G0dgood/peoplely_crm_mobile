import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef, useMemo, useState } from "react";
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type SearchFieldProps = TextInputProps & {
  containerStyle?: StyleProp<ViewStyle>;
  onSearch?: (value: string) => void;
};

const SearchField = forwardRef<TextInput, SearchFieldProps>(
  (
    {
      containerStyle,
      style,
      onSearch,
      value: controlledValue,
      defaultValue = "",
      ...textInputProps
    },
    ref
  ) => {
    const colorScheme = useColorScheme() ?? "light";
    const palette = Colors[colorScheme];
    const styles = useMemo(() => createStyles(palette), [palette]);

    const [internalValue, setInternalValue] = useState(
      controlledValue ?? defaultValue
    );

    const value = controlledValue ?? internalValue;

    const handleSearch = () => {
      onSearch?.(value.trim());
    };

    return (
      <View style={[styles.container, containerStyle]}>
        <TextInput
          ref={ref}
          value={value}
          onChangeText={controlledValue ? undefined : setInternalValue}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          placeholderTextColor={palette.primaryLighter}
          style={[styles.input, style]}
          {...textInputProps}
        />

        <TouchableOpacity
          onPress={handleSearch}
          style={styles.searchButton}
          accessibilityRole="button"
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={palette.textInverse}
          />
        </TouchableOpacity>
      </View>
    );
  }
);

SearchField.displayName = "SearchField";

const createStyles = (palette: (typeof Colors)["light"]) =>
  StyleSheet.create({
    container: {
      height: 50,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingRight: 8,
      paddingLeft: 16,
      backgroundColor: palette.accentWhite,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 12,
      elevation: 2,
    },
    input: {
      flex: 1,
      fontSize: 14,
      color: palette.textPrimary,
    },
    searchButton: {
      padding: 8,
      backgroundColor: palette.interactivePrimary,
    },
  });

export default SearchField;
