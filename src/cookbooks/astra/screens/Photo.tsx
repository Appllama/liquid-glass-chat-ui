import React from "react";
import { View, Text, useWindowDimensions } from "react-native";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import { usePageInsets } from "../insets";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { coast } from "../data";
import { GlassButton } from "../ui";
import { SNAP, useTheme } from "../theme";
export default function Photo() {
  const { width } = useWindowDimensions(),
    insets = usePageInsets(),
    t = useTheme();
  const scale = useSharedValue(1),
    base = useSharedValue(1);
  const dismiss = () => router.back();
  const pinch = Gesture.Pinch()
    .onStart(() => base.set(scale.get()))
    .onUpdate((e) =>
      scale.set(
        withSpring(Math.max(1, Math.min(3, base.get() * e.scale)), {
          stiffness: 600,
          damping: 36,
          mass: 0.35,
          overshootClamping: true,
        }),
      ),
    )
    .onEnd(() => {
      if (scale.get() < 1.05) scale.set(withSpring(1, SNAP));
    });
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));
  return (
    <View style={{ flex: 1, backgroundColor: t.bg, justifyContent: "center" }}>
      <StatusBar style={t.dark ? "light" : "dark"} />
      <View
        style={{
          position: "absolute",
          left: 24,
          right: 24,
          top: insets.top + 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600", color: t.text }}>
          A little escape
        </Text>
        <GlassButton
          name="xmark"
          label="Close photo"
          testID="close-photo"
          onPress={dismiss}
        />
      </View>
      <GestureDetector gesture={pinch}>
        <Animated.View style={style}>
          <Link.AppleZoomTarget>
            <Image
              source={coast}
              contentFit="contain"
              style={{ width, height: (width * 2) / 3 }}
            />
          </Link.AppleZoomTarget>
        </Animated.View>
      </GestureDetector>
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 38,
          left: 28,
          right: 28,
          gap: 8,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "600",
            letterSpacing: -0.6,
            color: t.text,
          }}
        >
          Somewhere with no plans.
        </Text>
        <Text style={{ fontSize: 13, color: t.muted }}>
          A moment shared by Mira · Today
        </Text>
      </View>
    </View>
  );
}
