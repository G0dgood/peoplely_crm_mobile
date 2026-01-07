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
import { Stack, useRootNavigationState, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Text, TextInput } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import "react-native-reanimated";

import { Provider } from "react-redux";

import NetworkStatusBanner from "@/components/NetworkStatusBanner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LineOfBusinessProvider } from "@/contexts/LineOfBusinessContext";
import { PrivilegeProvider } from "@/contexts/PrivilegeContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { useNetworkMonitor } from "@/hooks/useNetworkMonitor";
import { store } from "@/store";
import { syncPendingDispositions } from "@/utils/dispositionStorage";
import NetInfo from "@react-native-community/netinfo";

export const unstable_settings = {
  anchor: "(tabs)",
};

SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore error */
});

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
  const { user, isLoading: authLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": Poppins_400Regular,
    "Poppins-Medium": Poppins_500Medium,
    "Poppins-SemiBold": Poppins_600SemiBold,
    "Poppins-Bold": Poppins_700Bold,
  });

  // Monitor network status
  useNetworkMonitor();

  // Auth Protection
  useEffect(() => {
    if (authLoading) return;
    if (!rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === "auth";
    const inOnboarding = segments[0] === "onboarding";

    if (!user && !inAuthGroup && !inOnboarding) {
      // If not logged in and trying to access protected route, redirect to login
      // If at root (empty segments), let it fall through to default screen (Onboarding)
      if (segments.length > 0) {
        router.replace("/auth/login");
      }
    } else if (user && (inAuthGroup || inOnboarding || (segments as string[]).length === 0)) {
      // If logged in and at auth/onboarding or root, redirect to tabs
      router.replace("/(tabs)");
    }
  }, [user, segments, authLoading, rootNavigationState, router]);

  useEffect(() => {
    if (fontsLoaded && !themeLoading) {
      applyGlobalFontFamily();
      SplashScreen.hideAsync().catch((e) => {
        console.warn("SplashScreen.hideAsync error:", e);
      });
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

  if (!fontsLoaded || themeLoading || authLoading) {
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
