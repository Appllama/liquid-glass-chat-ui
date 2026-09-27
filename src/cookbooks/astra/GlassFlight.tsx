import React, { useEffect, useLayoutEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useDerivedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { Avatar } from "./ui";
import { useFlight, type Flight } from "./flight";

function TravelingPortrait({ flight }: { flight: Flight | null }) {
  const previousKey = useRef<number | null>(null);
  const p = useSharedValue(0);
  const finish = useFlight((state) => state.finish);
  useEffect(() => {
    if (!flight) return;
    // Recover from interrupted navigation or an unmounted destination.
    const timeout = setTimeout(() => finish(flight.key), 1400);
    return () => clearTimeout(timeout);
  }, [finish, flight]);
  useLayoutEffect(() => {
    if (!flight) return;
    if (previousKey.current !== flight.key) {
      previousKey.current = flight.key;
      p.set(0);
    }
    if (!flight.to) return;
    p.set(
      withSpring(1, { stiffness: 245, damping: 27, mass: 0.85 }, (done) => {
        if (done) scheduleOnRN(finish, flight.key);
      }),
    );
  }, [flight, finish, p]);
  const style = useAnimatedStyle(() => {
    const from = flight?.from ?? { x: 0, y: 0, size: 76 },
      to = flight?.to ?? from,
      v = p.get();
    const size = from.size + (to.size - from.size) * v;
    return {
      opacity: flight ? 1 : 0,
      transform: [
        { translateX: from.x + (to.x - from.x) * v },
        {
          translateY: from.y + (to.y - from.y) * v - Math.sin(Math.PI * v) * 12,
        },
        { scale: size / 76 },
        { scaleX: 1 + Math.sin(Math.PI * v) * 0.035 },
        { scaleY: 1 - Math.sin(Math.PI * v) * 0.025 },
      ],
    };
  });
  const light = useDerivedValue(() => Math.sin(Math.PI * p.get()) * 1.4);
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          width: 76,
          height: 76,
          transformOrigin: "top left",
        },
        style,
      ]}
    >
      <Avatar
        index={flight?.avatar ?? 0}
        size={76}
        motion={light}
        floating
        visible={!!flight}
      />
    </Animated.View>
  );
}
export function GlassFlight() {
  const flight = useFlight((state) => state.active);
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { zIndex: 100 }]}
    >
      <TravelingPortrait flight={flight} />
    </View>
  );
}
