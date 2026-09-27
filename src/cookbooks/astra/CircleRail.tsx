import React from "react";
import { Text, View } from "react-native";
import { usePortraitNavigation } from "./flight";
import {
  Gesture,
  GestureDetector,
  Pressable,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
  withSpring,
  cancelAnimation,
  useReducedMotion,
  useDerivedValue,
  useAnimatedReaction,
  type SharedValue,
} from "react-native-reanimated";
import { Avatar, tick } from "./ui";
import { people, type Person } from "./data";
import { SNAP, useTheme } from "./theme";
import {
  CIRCLE_DROP,
  COMPACT_CIRCLE_RIGHT,
  useCirclePan,
  type CircleMotion,
} from "./circleMotion";
const circle = people;
export function CircleRail({
  motion,
  width,
  top,
  onToggle,
}: {
  motion: CircleMotion;
  width: number;
  top: number;
  onToggle: () => void;
}) {
  const { progress, destination } = motion;
  const scroll = useSharedValue(0),
    start = useSharedValue(0),
    translationOrigin = useSharedValue(0);
  useAnimatedReaction(
    () => destination.get(),
    (target) => {
      if (!target) scroll.set(withSpring(0, SNAP));
    },
  );
  const hitArea = useAnimatedStyle(() => ({
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 106,
    transformOrigin: "top left",
    transform: [
      { translateY: CIRCLE_DROP * Math.max(0, Math.min(1, progress.get())) },
      { scaleY: Math.max(0, Math.min(1, progress.get())) },
    ],
  }));
  const max = Math.max(0, circle.length * 94 - width + 30);
  const horizontal = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .failOffsetY([-18, 18])
    .onBegin(() => {
      cancelAnimation(scroll);
    })
    .onStart((e) => {
      start.set(scroll.get());
      translationOrigin.set(e.translationX);
    })
    .onUpdate((e) => {
      const v = start.get() - (e.translationX - translationOrigin.get());
      scroll.set(v < 0 ? v * 0.2 : v > max ? max + (v - max) * 0.2 : v);
    })
    .onEnd((e) => {
      scroll.set(
        withSpring(
          Math.max(0, Math.min(max, scroll.get() - e.velocityX * 0.12)),
          { ...SNAP, velocity: -e.velocityX },
        ),
      );
    })
    .onFinalize((_e, success) => {
      if (!success)
        scroll.set(withSpring(Math.max(0, Math.min(max, scroll.get())), SNAP));
    });
  const vertical = useCirclePan(motion);
  return (
    <GestureDetector gesture={Gesture.Race(horizontal, vertical)}>
      <Animated.View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top,
          height: CIRCLE_DROP + 110,
          zIndex: 20,
        }}
      >
        <Animated.View style={hitArea} />
        {circle.map((person, index) => (
          <Orb
            key={person.id}
            {...{ person, index, motion, scroll, width, onToggle }}
          />
        ))}
      </Animated.View>
    </GestureDetector>
  );
}
function Orb({
  person,
  index,
  motion,
  scroll,
  width,
  onToggle,
}: {
  person: Person;
  index: number;
  motion: CircleMotion;
  scroll: SharedValue<number>;
  width: number;
  onToggle: () => void;
}) {
  const { progress, contact, drift, trailing } = motion;
  const { ref: portraitRef, open: openPortrait } = usePortraitNavigation(
    person,
    "circle",
  );
  const t = useTheme(),
    reduced = useReducedMotion();
  const style = useAnimatedStyle(() => {
    const p = Math.max(0, Math.min(1, progress.get()));
    // The visible quartet unfolds from the same stack on the same clock.
    // The fourth portrait starts behind the compact stack.
    const local = p;
    const fx =
        index < 4
          ? width - COMPACT_CIRCLE_RIGHT + Math.min(index, 2) * 20
          : width + 24 + (index - 3) * 94,
      ox = 24 + index * 94 - scroll.get();
    // Drop below the title before fanning out. The same curve reverses on close.
    const fan = local * local;
    const drop = 1 - (1 - local) * (1 - local);
    const middle = Math.sin(local * Math.PI);
    const tension = reduced
      ? 0
      : Math.max(-0.18, Math.min(0.18, p - trailing.get()));
    const lift = reduced ? 0 : contact.get() * middle;
    return {
      zIndex: circle.length - index,
      opacity:
        index < 3
          ? 1
          : interpolate(
              p,
              index === 3 ? [0.12, 0.5] : [0.32, 0.62],
              [0, 1],
              Extrapolation.CLAMP,
            ),
      transform: [
        {
          translateX: reduced
            ? p > 0.5
              ? ox
              : fx
            : fx + (ox - fx) * fan + drift.get() * middle,
        },
        {
          translateY: reduced
            ? p > 0.5
              ? CIRCLE_DROP
              : 0
            : CIRCLE_DROP * drop +
              middle * (index - 2) * -2 -
              lift * 2.5 +
              tension * (index - 2) * 8,
        },
        {
          scale: reduced
            ? p > 0.5
              ? 1
              : 36 / 76
            : 36 / 76 + (1 - 36 / 76) * local,
        },
        {
          rotate: `${reduced ? 0 : middle * (index - 2) * 1.3 + tension * (index - 2) * 12 + drift.get() * middle * 0.2}deg`,
        },
        { scaleX: 1 + tension * 0.16 },
        { scaleY: 1 - tension * 0.12 },
      ],
    };
  });
  const light = useDerivedValue(() => {
    // Offscreen lenses do not need a new GPU draw on every visible frame.
    const p = Math.max(0, Math.min(1, progress.get()));
    const startX =
      index < 4
        ? width - COMPACT_CIRCLE_RIGHT + Math.min(index, 2) * 20
        : width + 24 + (index - 3) * 94;
    const endX = 24 + index * 94 - scroll.get();
    const x = startX + (endX - startX) * p * p;
    if (x > width + 4 || x < -80) return 0;
    return (
      Math.sin(progress.get() * Math.PI) * 2 +
      scroll.get() / 300 -
      index * 0.25 +
      (reduced ? 0 : (progress.get() - trailing.get()) * 7 + drift.get() * 0.08)
    );
  });
  const nameStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.get(),
      [0.66, 0.94],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: 0,
          top: 0,
          width: 76,
          transformOrigin: "top left",
        },
        style,
      ]}
    >
      <Pressable
        collapsable={false}
        accessibilityLabel={`Open ${person.short}'s conversation`}
        testID={`circle-${person.id}`}
        onPress={() => {
          if (motion.suppressTap.get()) {
            motion.suppressTap.set(false);
            return;
          }
          if (progress.get() < 0.7) {
            onToggle();
          } else {
            tick();
            openPortrait();
          }
        }}
      >
        <View ref={portraitRef} collapsable={false}>
          <Avatar
            index={person.avatar}
            size={76}
            motion={light}
            slot={`circle-${person.id}`}
          />
        </View>
        <Animated.View
          style={[{ alignItems: "center", paddingTop: 9 }, nameStyle]}
        >
          <Text
            numberOfLines={1}
            style={{ fontSize: 12, fontWeight: "500", color: t.text }}
          >
            {person.short}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
