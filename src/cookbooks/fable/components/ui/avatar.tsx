import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { Orb } from "./orb";
import { Accent } from "../../constants/theme";
import { useTheme } from "../../hooks/use-theme";

type Props = {
  source: number;
  size: number;
  ring?: "unread" | "seen" | "none";
  ringWidth?: number;
  style?: StyleProp<ViewStyle>;
};

export function Avatar({
  source,
  size,
  ring = "none",
  ringWidth: ringWidthProp,
  style,
}: Props) {
  const theme = useTheme();
  const ringWidth =
    ring === "none" ? 0 : (ringWidthProp ?? Math.max(2, size * 0.04));
  const gap = ring === "none" ? 0 : Math.max(2, size * 0.035);
  const inner = size - 2 * (ringWidth + gap);
  return (
    <View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: ringWidth,
          borderColor:
            ring === "unread"
              ? Accent
              : ring === "seen"
                ? theme.seenRing
                : "transparent",
        },
        style,
      ]}
    >
      <Orb source={source} size={inner} />
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: "center",
    justifyContent: "center",
  },
});
