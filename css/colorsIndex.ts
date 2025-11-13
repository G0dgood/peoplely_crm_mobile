import { Colors as ThemePalette } from "@/constants/theme";

const light = ThemePalette.light;
const dark = ThemePalette.dark;

export const colors = {
  accent_green: light.mutedSageGreen,
  primary: light.primary,
  secondary: light.burntOrange,
  white: light.accentWhite,
  icon_background: light.offWhite2,
  background: light.background,
  small_text_color: light.primaryLighter,
  accent_green_light: light.paleMintGreen,
  black: light.black,
  red: light.mutedCoralRed,
  star: light.burntOrange,
  nostar: light.mediumGray,
  border_color: light.mediumGray,
  grayColor: light.shadowLight,
};

export const fonts = {
  Inter: {
    Regular: "Inter",
    Medium: "Inter-Medium",
    SemiBold: "Inter-SemiBold",
    Bold: "Inter-Bold",
  },
};

export const Colors = {
  text: light.textPrimary,
  headerTintColor: light.accentWhite,
  TopTab: light.accentWhite,
  buttonTab: light.burntOrange,
  background: light.background,
  tint: light.burntOrange,
  tabIconDefault: light.slateGray,
  tabIconSelected: light.burntOrange,
  inactiveTab: light.slateGray,
  borderColor: light.mediumGray,
  light: {
    text: light.textPrimary,
    headerTintColor: light.accentWhite,
    TopTab: light.accentWhite,
    buttonTab: light.burntOrange,
    background: light.background,
    tint: light.burntOrange,
    tabIconDefault: light.slateGray,
    tabIconSelected: light.burntOrange,
    inactiveTab: light.slateGray,
    borderColor: light.mediumGray,
  },
  dark: {
    text: dark.textPrimary,
    headerTintColor: dark.accentWhite,
    TopTab: dark.accentWhite,
    buttonTab: dark.burntOrange,
    background: dark.background,
    tint: dark.burntOrange,
    tabIconDefault: dark.slateGray,
    tabIconSelected: dark.burntOrange,
    inactiveTab: dark.slateGray,
    borderColor: dark.mediumGray,
  },
};
