import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef, useMemo } from "react";
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type SearchFieldProps = TextInputProps & {
  containerStyle?: StyleProp<ViewStyle>;
};

const SearchField = forwardRef<TextInput, SearchFieldProps>(
  ({ containerStyle, style, ...textInputProps }, ref) => {
    const colorScheme = useColorScheme() ?? "light";
    const palette = Colors[colorScheme];
    const styles = useMemo(() => createStyles(palette), [palette]);

    return (
      <View style={[styles.container, containerStyle]}>
        <Ionicons
          name="search-outline"
          size={18}
          color={palette.primaryLighter}
        />
        <TextInput
          ref={ref}
          style={[styles.input, style]}
          placeholderTextColor={palette.primaryLighter}
          {...textInputProps}
        />
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
      paddingHorizontal: 16,
      paddingVertical: 2,
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
  });

export default SearchField;
