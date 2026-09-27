import * as Haptics from "expo-haptics";
import { SymbolView } from "expo-symbols";
import { useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import Animated, {
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Glass } from "../ui/glass";
import { EASE_OUT } from "../../constants/motion";
import { Accent, Radius, Space, Type } from "../../constants/theme";
import { useTheme } from "../../hooks/use-theme";

const BTN = 44;

type Props = {
  insetBottom: number;
  onSend: (text: string) => void;
  onAttach: () => void;
  onLayoutHeight: (h: number) => void; // full height incl. safe-area padding
};

/**
 * The floating composer card in liquid glass: the text line on top,
 * a row of round actions beneath. It rides the keyboard, including the
 * interactive drag-to-dismiss, and the send button swaps in for the mic
 * the moment there is text.
 */
export function Composer({
  insetBottom,
  onSend,
  onAttach,
  onLayoutHeight,
}: Props) {
  const theme = useTheme();
  const inputRef = useRef<TextInput>(null);
  const draft = useRef("");
  const [hasText, setHasText] = useState(false);
  const sendT = useSharedValue(0);

  const sendStyle = useAnimatedStyle(() => ({
    opacity: sendT.get(),
    transform: [{ scale: 0.7 + 0.3 * sendT.get() }],
  }));
  const micStyle = useAnimatedStyle(() => ({
    opacity: 1 - sendT.get(),
    transform: [{ scale: 1 - 0.3 * sendT.get() }],
  }));

  const onChangeText = (t: string) => {
    draft.current = t;
    const has = t.trim().length > 0;
    if (has !== hasText) {
      setHasText(has);
      sendT.set(withTiming(has ? 1 : 0, { duration: 180, easing: EASE_OUT }));
    }
  };

  const submit = () => {
    const text = draft.current.trim();
    if (!text) return;
    inputRef.current?.clear();
    onChangeText("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend(text);
  };

  const onLayout = (e: LayoutChangeEvent) =>
    onLayoutHeight(e.nativeEvent.layout.height);

  return (
    <KeyboardStickyView
      offset={{ closed: 0, opened: insetBottom }}
      style={styles.sticky}
    >
      <View
        onLayout={onLayout}
        style={[styles.root, { paddingBottom: insetBottom + Space[2] }]}
      >
        <Animated.View
          layout={LinearTransition.duration(220).easing(EASE_OUT.factory())}
          style={[styles.lift, { boxShadow: theme.lift }]}
        >
          <Glass style={styles.card}>
            <TextInput
              ref={inputRef}
              accessibilityLabel="Message"
              testID="fable-message-input"
              multiline
              placeholder="Message"
              placeholderTextColor={theme.placeholder}
              onChangeText={onChangeText}
              onSubmitEditing={submit}
              submitBehavior="submit"
              returnKeyType="send"
              enablesReturnKeyAutomatically
              selectionColor={Accent}
              style={[Type.body, styles.input, { color: theme.label }]}
            />
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Share a photo"
                onPress={() => {
                  Keyboard.dismiss();
                  onAttach();
                }}
                hitSlop={6}
                style={[styles.round, { backgroundColor: theme.chip }]}
              >
                <SymbolView
                  name="plus"
                  size={19}
                  weight="medium"
                  tintColor={theme.label}
                />
              </Pressable>
              <View style={styles.spacer} />
              <View style={styles.round}>
                <Animated.View
                  accessibilityElementsHidden={hasText}
                  importantForAccessibility={
                    hasText ? "no-hide-descendants" : "auto"
                  }
                  pointerEvents={hasText ? "none" : "auto"}
                  style={[StyleSheet.absoluteFill, micStyle]}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Voice message"
                    onPress={() =>
                      Alert.alert(
                        "Voice messages",
                        "Voice recording is not available in this preview.",
                      )
                    }
                    hitSlop={6}
                    style={[styles.round, { backgroundColor: theme.chip }]}
                  >
                    <SymbolView
                      name="mic.fill"
                      size={18}
                      weight="medium"
                      tintColor={theme.label}
                    />
                  </Pressable>
                </Animated.View>
                <Animated.View
                  accessibilityElementsHidden={!hasText}
                  importantForAccessibility={
                    hasText ? "auto" : "no-hide-descendants"
                  }
                  pointerEvents={hasText ? "auto" : "none"}
                  style={[StyleSheet.absoluteFill, sendStyle]}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Send"
                    hitSlop={6}
                    onPress={submit}
                    style={[styles.round, { backgroundColor: theme.outgoing }]}
                  >
                    <SymbolView
                      name="arrow.up"
                      size={17}
                      weight="bold"
                      tintColor={theme.outgoingText}
                    />
                  </Pressable>
                </Animated.View>
              </View>
            </View>
          </Glass>
        </Animated.View>
      </View>
    </KeyboardStickyView>
  );
}

const styles = StyleSheet.create({
  sticky: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  root: {
    paddingHorizontal: Space[4],
    paddingTop: Space[2],
  },
  lift: {
    borderRadius: Radius.card,
    borderCurve: "continuous",
  },
  card: {
    borderRadius: Radius.card,
    paddingHorizontal: Space[3],
    paddingTop: 2,
    paddingBottom: Space[3],
  },
  input: {
    maxHeight: 138,
    paddingHorizontal: Space[2],
    paddingTop: 15,
    paddingBottom: 12,
    lineHeight: 23,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  spacer: {
    flex: 1,
  },
  round: {
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
