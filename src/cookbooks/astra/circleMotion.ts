import { Gesture } from "react-native-gesture-handler";
import {
  cancelAnimation,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { BLOOM, SNAP } from "./theme";
import { tick } from "./ui";

// The portrait drop and the content displacement share the same spacing budget.
export const CIRCLE_DROP = 56;
export const CIRCLE_TRAVEL = CIRCLE_DROP + 54;
export const COMPACT_CIRCLE_RIGHT = 197;

export function useCircleMotion(onSettled: (expanded: boolean) => void) {
  const progress = useSharedValue(0);
  const destination = useSharedValue(0);
  const contact = useSharedValue(0);
  const drift = useSharedValue(0);
  const suppressTap = useSharedValue(false);
  const reduced = useReducedMotion();
  // The row follows the finger exactly. Only its optical response has inertia.
  // When a finger pauses, this catches up and the lenses softly settle in place.
  const trailing = useDerivedValue(() =>
    reduced
      ? progress.get()
      : withSpring(progress.get(), { damping: 20, stiffness: 210, mass: 0.65 }),
  );
  const settle = (target: number, velocity = 0, feedback = false) => {
    "worklet";
    destination.set(target);
    contact.set(withSpring(0, SNAP));
    drift.set(withSpring(0, SNAP));
    progress.set(
      reduced
        ? withTiming(target, { duration: 160 }, (finished) => {
            if (finished) scheduleOnRN(onSettled, target === 1);
          })
        : withSpring(
            target,
            {
              ...BLOOM,
              velocity: Math.max(-4, Math.min(4, velocity / CIRCLE_TRAVEL)),
            },
            (finished) => {
              if (finished) scheduleOnRN(onSettled, target === 1);
            },
          ),
    );
    if (feedback) scheduleOnRN(tick);
  };
  return {
    progress,
    destination,
    contact,
    drift,
    trailing,
    suppressTap,
    settle,
    reduced,
  };
}

export type CircleMotion = ReturnType<typeof useCircleMotion>;

// Each surface has its own gesture origin; all surfaces manipulate one row.
export function useCirclePan(
  motion: CircleMotion,
  scrollY?: SharedValue<number>,
) {
  const { progress, destination, contact, drift, suppressTap, settle } = motion;
  const origin = useSharedValue(0);
  const translationOrigin = useSharedValue(0);
  const eligible = useSharedValue(false);
  const active = useSharedValue(false);
  const beganAt = useSharedValue(0);
  const caughtSpring = useSharedValue(false);
  return Gesture.Pan()
    .activeOffsetY([-7, 7])
    .failOffsetX([-22, 22])
    .onBegin(() => {
      eligible.set(!scrollY || scrollY.get() <= 1 || progress.get() > 0.01);
      active.set(false);
      suppressTap.set(false);
      // This is a UI-thread input callback, never a render-time clock read.
      // eslint-disable-next-line react-hooks/purity
      beganAt.set(Date.now());
      if (!eligible.get()) return;
      // Catch a running spring on touch-down, before the drag threshold.
      cancelAnimation(progress);
      origin.set(progress.get());
      caughtSpring.set(progress.get() > 0.01 && progress.get() < 0.99);
      if (caughtSpring.get()) contact.set(withSpring(1, SNAP));
    })
    .onStart((e) => {
      if (!eligible.get()) return;
      active.set(true);
      translationOrigin.set(e.translationY);
      contact.set(withSpring(1, SNAP));
    })
    .onUpdate((e) => {
      if (!eligible.get()) return;
      const travel = e.translationY - translationOrigin.get();
      if (origin.get() <= 0 && travel < 0) return;
      const raw = origin.get() + travel / CIRCLE_TRAVEL;
      const p =
        raw < 0
          ? -(1 - Math.exp(raw * 3)) * 0.1
          : raw > 1
            ? 1 + (1 - Math.exp((1 - raw) * 3)) * 0.1
            : raw;
      progress.set(p);
      drift.set(
        withSpring(Math.max(-10, Math.min(10, e.translationX * 0.18)), SNAP),
      );
    })
    .onEnd((e, success) => {
      if (!eligible.get() || !success) return;
      const projected = progress.get() + (e.velocityY * 0.12) / CIRCLE_TRAVEL;
      settle(projected > 0.5 ? 1 : 0, e.velocityY, true);
    })
    .onFinalize((_e, success) => {
      if (!eligible.get() || success) return;
      // A deliberate catch-and-hold is not a second tap when the finger lifts.
      // eslint-disable-next-line react-hooks/purity
      const heldCatch = caughtSpring.get() && Date.now() - beganAt.get() > 180;
      suppressTap.set(heldCatch);
      settle(
        active.get() || heldCatch
          ? progress.get() > 0.5
            ? 1
            : 0
          : destination.get(),
      );
    });
}
