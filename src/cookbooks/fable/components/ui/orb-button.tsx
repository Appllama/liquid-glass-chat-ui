import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Orb } from "./orb";
import { EASE_OUT, PRESS_MS } from "../../constants/motion";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  source: number;
  size?: number;
  onPress?: () => void;
  accessibilityLabel: string;
};

/**
 * A bar button that is the orb itself. The orb is already glass, so it gets
 * no second ring around it; the seating halo does the work a bezel would.
 */
export function OrbButton({
  source,
  size = 40,
  onPress,
  accessibilityLabel,
}: Props) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={onPress}
      onPressIn={() =>
        scale.set(withTiming(0.92, { duration: PRESS_MS, easing: EASE_OUT }))
      }
      onPressOut={() =>
        scale.set(withTiming(1, { duration: 200, easing: EASE_OUT }))
      }
      style={[{ width: size, height: size }, style]}
    >
      <Orb source={source} size={size} />
    </AnimatedPressable>
  );
}
