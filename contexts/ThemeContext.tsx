import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";

export type ColorScheme = "light" | "dark" | "auto";

const THEME_STORAGE_KEY = "@peoplely_theme_preference";

type ThemeContextValue = {
  colorScheme: ColorScheme;
  resolvedColorScheme: "light" | "dark";
  isLoading: boolean;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

type ThemeProviderProps = {
  children: React.ReactNode;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useRNColorScheme();
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>("auto");
  const [isLoading, setIsLoading] = useState(true);

  // Resolve the actual color scheme to use
  const resolvedColorScheme: "light" | "dark" =
    colorScheme === "auto"
      ? (systemColorScheme ?? "light")
      : colorScheme;

  // Load saved preference from AsyncStorage on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedPreference = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedPreference && (savedPreference === "light" || savedPreference === "dark" || savedPreference === "auto")) {
        setColorSchemeState(savedPreference as ColorScheme);
      }
    } catch (error) {
      console.error("Error loading theme preference:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save preference to AsyncStorage when it changes
  const setColorScheme = async (scheme: ColorScheme) => {
    try {
      setColorSchemeState(scheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const toggleDarkMode = () => {
    if (colorScheme === "dark") {
      setColorScheme("light");
    } else if (colorScheme === "light") {
      setColorScheme("dark");
    } else {
      // If auto, toggle to the opposite of current system scheme
      setColorScheme(systemColorScheme === "dark" ? "light" : "dark");
    }
  };

  const value: ThemeContextValue = {
    colorScheme,
    resolvedColorScheme,
    isLoading,
    setColorScheme,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export default ThemeContext;

