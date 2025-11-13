import { Colors as ThemePalette } from "@/constants/theme";
import { PixelRatio, StyleSheet } from "react-native";

const light = ThemePalette.light;
const dark = ThemePalette.dark;

export const theme = {
  colors: {
    primary: light.burntOrange,
    primaryLight: light.paleCream,
    white: light.accentWhite,
    secondary: light.mutedSageGreen,
    secondaryLight: light.paleMintGreen,
    onSecondary: light.textInverse,
    tertiary: light.slateGray,
    tertiaryLight: light.darkSlateGray,
    onTertiary: light.textInverse,
    error: light.statusError,
    outline: light.mediumGray,
    red: light.statusError,
    green: light.statusSuccess,
    bluelight: dark.background,
    bluelighter: dark.offWhite,
    blue: light.interactivePrimary,
    black: light.black,
    lightgray: light.offWhite,
    lightgray_two: light.offWhite2,
    lightgray_three: light.lightGray,
    dimgray: light.slateGray,
    text: light.textPrimary,
  },
  darkColors: {
    primary: dark.burntOrange,
    primaryLight: dark.paleCream,
    white: dark.accentWhite,
    secondary: dark.mutedSageGreen,
    secondaryLight: dark.paleMintGreen,
    onSecondary: dark.textInverse,
    tertiary: dark.slateGray,
    tertiaryLight: dark.darkSlateGray,
    onTertiary: dark.textInverse,
    error: dark.statusError,
    outline: dark.mediumGray,
    red: dark.statusError,
    green: dark.statusSuccess,
    bluelight: dark.background,
    bluelighter: dark.offWhite,
    blue: dark.interactivePrimary,
    black: dark.black,
    lightgray: dark.offWhite,
    lightgray_two: dark.offWhite2,
    lightgray_three: dark.lightGray,
    dimgray: dark.slateGray,
    text: dark.textPrimary,
  },
  dimensions: {
    radius: 10,
  },
} as const;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  flex_centered: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
  dropdownButtonStyle: {
    width: "100%",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.outline,
    textAlign: "left",
    borderRadius: 5,
  },
  profileImage: {
    height: 75,
    width: 75,
    resizeMode: "contain",
    borderRadius: 1000,
    borderWidth: 3,
    borderColor: "#0001",
    marginRight: 10,
    backgroundColor: "#0003",
  },
  absolute: { position: "absolute" },
  relative: { position: "relative" },
});

const deviceFont = 12 * PixelRatio.getFontScale();
export const defaultFontSize = Math.max(Math.min(deviceFont, 13), 10);

export default styles;
