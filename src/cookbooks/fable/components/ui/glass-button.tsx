import { SymbolView, type SFSymbol } from "expo-symbols";
import type { ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Glass } from "./glass";
import { EASE_OUT, PRESS_MS } from "../../constants/motion";
import { useTheme } from "../../hooks/use-theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  symbol?: SFSymbol;
  size?: number;
  iconSize?: number;
  tint?: string;
  onPress?: () => void;
  accessibilityLabel: string;
  children?: ReactNode;
};

/** A circular liquid-glass bar button. Press feedback lands on press-in. */
export function GlassButton({
  symbol,
  size = 44,
  iconSize = 18,
  tint,
  onPress,
  accessibilityLabel,
  children,
}: Props) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      onPress={onPress}
      onPressIn={() =>
        scale.set(withTiming(0.92, { duration: PRESS_MS, easing: EASE_OUT }))
      }
      onPressOut={() =>
        scale.set(withTiming(1, { duration: 200, easing: EASE_OUT }))
      }
      style={[{ width: size, height: size }, style]}
    >
      <Glass
        interactive
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        {children ??
          (symbol ? (
            <SymbolView
              name={symbol}
              size={iconSize}
              weight="semibold"
              tintColor={tint ?? theme.label}
            />
          ) : null)}
      </Glass>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
});
