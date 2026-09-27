import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  FadeIn,
  cancelAnimation,
  useReducedMotion,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { BUBBLE_AVATAR } from "./bubble";
import { Orb } from "../ui/orb";
import { Radius, Space } from "../../constants/theme";
import type { Person } from "../../data/people";
import { useScheme, useTheme } from "../../hooks/use-theme";

function Dot({ delay, color }: { delay: number; color: string }) {
  const t = useSharedValue(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    t.set(
      withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 320 }),
            withTiming(0, { duration: 320 }),
          ),
          -1,
        ),
      ),
    );
    return () => cancelAnimation(t);
  }, [delay, t, reduced]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.3 + 0.7 * t.get(),
    transform: [{ translateY: -3 * t.get() }],
  }));
  return (
    <Animated.View style={[styles.dot, { backgroundColor: color }, style]} />
  );
}

export function TypingBubble({ person }: { person: Person }) {
  const theme = useTheme();
  const scheme = useScheme();
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(140)}
      style={styles.row}
    >
      <Orb source={person.avatar} size={BUBBLE_AVATAR} />
      <View
        accessibilityLabel={`${person.first} is typing`}
        style={[
          styles.bubble,
          {
            backgroundColor: theme.surface,
            boxShadow:
              scheme === "dark"
                ? undefined
                : "0 4px 18px rgba(16, 16, 18, 0.05)",
          },
        ]}
      >
        <Dot delay={0} color={theme.secondary} />
        <Dot delay={140} color={theme.secondary} />
        <Dot delay={280} color={theme.secondary} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: Space[4],
    marginTop: Space[5],
  },
  bubble: {
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 18,
    height: 50,
    alignItems: "center",
    borderRadius: Radius.bubble,
    borderCurve: "continuous",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});
