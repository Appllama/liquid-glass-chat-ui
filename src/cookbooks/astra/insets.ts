import {
  initialWindowMetrics,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

// Full-screen portrait routes retain the window's top inset while native
// navigation/keyboard layout briefly reports zero. Sheets use their own insets.
export function usePageInsets() {
  const insets = useSafeAreaInsets();
  return {
    ...insets,
    top: Math.max(insets.top, initialWindowMetrics?.insets.top ?? 0),
  };
}
