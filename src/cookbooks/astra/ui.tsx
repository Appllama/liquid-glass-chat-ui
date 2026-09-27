import React from "react";
import { Pressable } from "react-native-gesture-handler";
import {
  View,
  Text,
  ActivityIndicator,
  type ViewStyle,
  type StyleProp,
} from "react-native";
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { createButton } from "@gluestack-ui/button";
import { useChat } from "./data";
import { useFlight } from "./flight";
import { GlassPortrait } from "./GlassPortrait";
import type { SharedValue } from "react-native-reanimated";
import { useTheme } from "./theme";

export const Button = createButton({
  Root: Pressable,
  Text,
  Group: View,
  Spinner: ActivityIndicator,
  Icon: View,
});
export function tick() {
  if (useChat.getState().haptics) void Haptics.selectionAsync();
}
export function impact() {
  if (useChat.getState().haptics)
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}
export function Icon({
  name,
  size = 21,
  color,
}: {
  name: SymbolViewProps["name"];
  size?: number;
  color?: string;
}) {
  const t = useTheme();
  return (
    <SymbolView
      name={name}
      size={size}
      weight="medium"
      tintColor={color ?? t.text}
      style={{ width: size, height: size }}
    />
  );
}
const nativeGlass =
  process.env.EXPO_OS === "ios" &&
  isGlassEffectAPIAvailable() &&
  isLiquidGlassAvailable();
export function Glass({
  children,
  style,
  clear = false,
  interactive = false,
  tint,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  clear?: boolean;
  interactive?: boolean;
  tint?: string;
}) {
  const t = useTheme();
  if (!nativeGlass)
    return (
      <View
        style={[
          {
            backgroundColor: t.bubble,
            borderRadius: 28,
            borderCurve: "continuous",
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  return (
    <GlassView
      colorScheme={t.scheme}
      glassEffectStyle={clear ? "clear" : "regular"}
      isInteractive={interactive}
      tintColor={tint}
      style={[{ borderRadius: 28, borderCurve: "continuous" }, style]}
    >
      {children}
    </GlassView>
  );
}
export function GlassButton({
  name,
  label,
  onPress,
  size = 46,
  testID,
}: {
  name: SymbolViewProps["name"];
  label: string;
  onPress: () => void;
  size?: number;
  testID?: string;
}) {
  return (
    <Button
      accessibilityLabel={label}
      testID={testID}
      onPress={() => {
        tick();
        onPress();
      }}
      style={{ width: size, height: size }}
    >
      <Glass
        clear
        interactive
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={name} size={20} />
      </Glass>
    </Button>
  );
}
export const Avatar = React.memo(function Avatar({
  index,
  size = 58,
  online = false,
  motion,
  floating = false,
  visible = true,
  slot,
}: {
  index: number;
  size?: number;
  online?: boolean;
  floating?: boolean;
  visible?: boolean;
  slot?: string;
  motion?: SharedValue<number>;
}) {
  const t = useTheme();
  const hidden = useFlight(
    (state) =>
      !floating &&
      !!slot &&
      !!state.active &&
      (state.active.from.slot === slot ||
        state.active.to?.slot === slot ||
        slot === `header-${state.active.person}`),
  );
  return (
    <View
      style={{
        opacity: hidden ? 0.001 : 1,
        width: size,
        height: size,
        borderRadius: size / 2,
        boxShadow: [
          {
            offsetX: 0,
            offsetY: size * 0.09,
            blurRadius: size * 0.13,
            spreadDistance: -size * 0.04,
            color: t.dark ? "#00000070" : "#17242429",
          },
        ],
      }}
    >
      <GlassPortrait
        index={index}
        size={size}
        motion={motion}
        dark={t.dark}
        visible={visible && !hidden}
      />
      {online && (
        <View
          style={{
            position: "absolute",
            right: 1,
            bottom: 1,
            width: 9,
            height: 9,
            borderRadius: 5,
            backgroundColor: "#759B88",
            borderWidth: 2,
            borderColor: t.bg,
          }}
        />
      )}
    </View>
  );
});
export function FadeEdge({
  bottom = false,
  height = 45,
}: {
  bottom?: boolean;
  height?: number;
}) {
  const t = useTheme();
  return (
    <LinearGradient
      pointerEvents="none"
      colors={bottom ? [`${t.bg}00`, t.bg] : [t.bg, `${t.bg}00`]}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        [bottom ? "bottom" : "top"]: 0,
        height,
      }}
    />
  );
}
