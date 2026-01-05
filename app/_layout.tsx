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
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Text, TextInput } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import "react-native-reanimated";

import { Provider } from "react-redux";

import NetworkStatusBanner from "@/components/NetworkStatusBanner";
import { AuthProvider } from "@/contexts/AuthContext";
import { PrivilegeProvider } from "@/contexts/PrivilegeContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { LineOfBusinessProvider } from "@/contexts/LineOfBusinessContext";
import { useNetworkMonitor } from "@/hooks/useNetworkMonitor";
import { store } from "@/store";
import { syncPendingDispositions } from "@/utils/dispositionStorage";
import NetInfo from "@react-native-community/netinfo";

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

function AppContent() {
  const { resolvedColorScheme, isLoading: themeLoading } = useTheme();
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": Poppins_400Regular,
    "Poppins-Medium": Poppins_500Medium,
    "Poppins-SemiBold": Poppins_600SemiBold,
    "Poppins-Bold": Poppins_700Bold,
  });

  // Monitor network status
  useNetworkMonitor();

  useEffect(() => {
    if (fontsLoaded && !themeLoading) {
      applyGlobalFontFamily();
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, themeLoading]);

  // Global sync mechanism for offline dispositions
  useEffect(() => {
    // Initial sync check
    NetInfo.fetch().then((state) => {
      if (state.isConnected) {
        syncPendingDispositions();
      }
    });

    // Monitor network and sync when online
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        syncPendingDispositions();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!fontsLoaded || themeLoading) {
    return null;
  }

  return (
    <NavigationThemeProvider
      value={resolvedColorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <PaperProvider>
        <NetworkStatusBanner />
        <Stack>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen 
            name="auth/login" 
            options={{ 
              headerShown: false,
              gestureEnabled: false
            }} 
          />
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
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <LineOfBusinessProvider>
          <PrivilegeProvider>
            <ThemeProvider>
              <SocketProvider>
                <AppContent />
              </SocketProvider>
            </ThemeProvider>
          </PrivilegeProvider>
        </LineOfBusinessProvider>
      </AuthProvider>
    </Provider>
  );
}
