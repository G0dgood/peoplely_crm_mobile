import React from "react";
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type PageTitleProps = {
  title: string;
  subtitle?: string;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
};

const PageTitle: React.FC<PageTitleProps> = ({
  title,
  subtitle,
  containerStyle,
  titleStyle,
  subtitleStyle,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = React.useMemo(() => createStyles(palette), [palette]);

  return (
    <View style={[styles.root, containerStyle]}>
      <Text style={[styles.title, titleStyle]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text> : null}
    </View>
  );
};

const createStyles = (palette: (typeof Colors)["light"]) =>
  StyleSheet.create({
    root: {
      gap: 4,
    },
    title: {
      fontSize: 18,
      fontFamily: "Poppins-SemiBold",
      color: palette.textPrimary,
    },
    subtitle: {
      fontSize: 14,
      fontFamily: "Poppins-Regular",
      color: palette.textSecondary,
    },
  });

export default PageTitle;

