import { BlurView } from "expo-blur";
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import type { ReactNode } from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useScheme } from "../../hooks/use-theme";

export const GLASS =
  process.env.EXPO_OS === "ios" &&
  isGlassEffectAPIAvailable() &&
  isLiquidGlassAvailable();

type GlassProps = ViewProps & {
  style?: StyleProp<ViewStyle>;
  effect?: "regular" | "clear";
  tint?: string;
  interactive?: boolean;
  children?: ReactNode;
};

/**
 * Liquid glass surface on iOS 26+, a blurred translucent surface elsewhere.
 * Never give it opacity 0 — that silently disables the glass.
 */
export function Glass({
  style,
  effect = "regular",
  tint,
  interactive = false,
  children,
  ...rest
}: GlassProps) {
  const scheme = useScheme();
  if (GLASS) {
    return (
      <GlassView
        colorScheme={scheme}
        glassEffectStyle={effect}
        tintColor={tint}
        isInteractive={interactive}
        style={[styles.base, style]}
        {...rest}
      >
        {children}
      </GlassView>
    );
  }
  const flat = StyleSheet.flatten(style) ?? {};
  return (
    <View style={[styles.base, style, { overflow: "hidden" }]} {...rest}>
      <BlurView
        intensity={40}
        tint={scheme === "dark" ? "dark" : "light"}
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: flat.borderRadius as number | undefined },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor:
              tint ??
              (scheme === "dark"
                ? "rgba(40,40,44,0.55)"
                : "rgba(255,255,255,0.55)"),
          },
        ]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderCurve: "continuous",
  },
});
