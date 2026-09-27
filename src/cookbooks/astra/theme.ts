import { useColorScheme } from "react-native";
import { useChat } from "./data";
export const SNAP = { damping: 26, stiffness: 270, mass: 0.9 };
export const BLOOM = { damping: 23, stiffness: 230, mass: 0.9 };
export function useTheme() {
  const preference = useChat((s) => s.theme),
    system = useColorScheme();
  const dark =
    preference === "dark" || (preference === "system" && system === "dark");
  return {
    dark,
    scheme: dark ? ("dark" as const) : ("light" as const),
    bg: dark ? "#171819" : "#F2F2F2",
    paper: dark ? "#222426" : "#F8F8F8",
    text: dark ? "#F5F5F5" : "#17191B",
    muted: dark ? "#A5A9AE" : "#82878B",
    line: dark ? "#35373A" : "#E4E5E6",
    chip: dark ? "#2B2D30" : "#E8E9EA",
    bubble: dark ? "#343638" : "#FFFFFF",
    ink: dark ? "#E7E9EB" : "#242628",
    onInk: dark ? "#191B1D" : "#FFFFFF",
    blue: "#3D92E9",
  };
}
