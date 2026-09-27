import { useColorScheme } from "react-native";
import { useFable } from "../data/store";

import { Palette, type Scheme, type Theme } from "../constants/theme";

export function useScheme(): Scheme {
  const s = useColorScheme();
  const preference = useFable((state) => state.theme);
  return preference === "system"
    ? s === "dark"
      ? "dark"
      : "light"
    : preference;
}

export function useTheme(): Theme {
  return Palette[useScheme()];
}
