import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Text, TextInput } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

void SplashScreen.preventAutoHideAsync();

let hasAppliedGlobalFont = false;

const textComponent = Text as unknown as { defaultProps?: { style?: any } };
const textInputComponent = TextInput as unknown as {
  defaultProps?: { style?: any };
};

const applyGlobalFontFamily = () => {
  if (hasAppliedGlobalFont) {
    return;
  }

  const defaultStyle = { fontFamily: "Poppins-Regular" } as const;

  const mergeStyle = (existing: any) => {
    if (!existing) return defaultStyle;
    if (Array.isArray(existing)) return [...existing, defaultStyle];
    return [existing, defaultStyle];
  };

  textComponent.defaultProps = textComponent.defaultProps || {};
  textComponent.defaultProps.style = mergeStyle(
    textComponent.defaultProps.style
  );

  textInputComponent.defaultProps = textInputComponent.defaultProps || {};
  textInputComponent.defaultProps.style = mergeStyle(
    textInputComponent.defaultProps.style
  );

  hasAppliedGlobalFont = true;
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": Poppins_400Regular,
    "Poppins-Medium": Poppins_500Medium,
    "Poppins-SemiBold": Poppins_600SemiBold,
    "Poppins-Bold": Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      applyGlobalFontFamily();
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <PaperProvider>
        <Stack>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen
            name="auth/forgot-password"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
          <Stack.Screen
            name="notifications"
            options={{ headerShown: false, headerTitle: "Notifications" }}
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{
              headerShown: false,
              presentation: "transparentModal",
              contentStyle: { backgroundColor: "transparent" },
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </PaperProvider>
    </ThemeProvider>
  );
}
