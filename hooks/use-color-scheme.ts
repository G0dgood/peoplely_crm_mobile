import { useTheme } from "@/contexts/ThemeContext";

export function useColorScheme() {
  const { resolvedColorScheme } = useTheme();
  return resolvedColorScheme;
}
