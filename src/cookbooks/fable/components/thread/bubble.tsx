import { Image } from "expo-image";
import { router } from "expo-router";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Orb } from "../ui/orb";
import { EASE_OUT, SOFT } from "../../constants/motion";
import { Ink, Radius, Space, Type } from "../../constants/theme";
import type { Message } from "../../data/messages";
import type { Person } from "../../data/people";
import { useScheme, useTheme } from "../../hooks/use-theme";

export const BUBBLE_AVATAR = 26;

/**
 * Outgoing bubbles leave the composer: they start where the text was typed,
 * a shade lighter and slightly larger (the composer's own scale), and settle
 * into place as ink. Scaling down from 1.02 keeps the glyphs crisp.
 */
const enterOutgoing = () => {
  "worklet";
  return {
    initialValues: {
      opacity: 0,
      transform: [{ translateY: 22 }, { scale: 1.02 }],
    },
    animations: {
      opacity: withTiming(1, { duration: 140 }),
      transform: [
        { translateY: withSpring(0, SOFT) },
        { scale: withSpring(1, SOFT) },
      ],
    },
  };
};

type Props = {
  message: Message;
  person: Person;
  showAvatar: boolean; // last incoming bubble in a run carries the avatar, grouped by sender
  first: boolean; // first bubble of a run gets the wider gap
  animate: boolean; // only messages that arrive after mount animate in
};

export const Bubble = memo(function Bubble({
  message,
  person,
  showAvatar,
  first,
  animate,
}: Props) {
  const theme = useTheme();
  const scheme = useScheme();
  const mine = message.from === "me";

  return (
    <Animated.View
      entering={
        animate
          ? mine
            ? enterOutgoing
            : FadeInDown.duration(260).easing(EASE_OUT.factory())
          : undefined
      }
      style={[
        styles.row,
        mine ? styles.rowMine : styles.rowTheirs,
        { marginTop: first ? Space[5] : Space[2] },
      ]}
    >
      {!mine && (
        <View style={styles.avatarSlot}>
          {showAvatar && <Orb source={person.avatar} size={BUBBLE_AVATAR} />}
        </View>
      )}
      {message.photo ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open shared photo"
          onPress={() =>
            router.push({ pathname: "/fable/photo", params: { id: person.id } })
          }
          style={{
            width: "72%",
            aspectRatio: 0.9,
            borderRadius: 26,
            overflow: "hidden",
          }}
        >
          <Image source={person.story} style={{ flex: 1 }} contentFit="cover" />
        </Pressable>
      ) : mine ? (
        <View
          style={[
            styles.bubble,
            styles.mine,
            { backgroundColor: theme.outgoing },
          ]}
        >
          <Text selectable style={[Type.body, { color: theme.outgoingText }]}>
            {message.text}
          </Text>
        </View>
      ) : (
        <View
          style={[
            styles.bubble,
            styles.theirs,
            {
              backgroundColor: theme.surface,
              boxShadow:
                scheme === "dark"
                  ? undefined
                  : "0 4px 18px rgba(16, 16, 18, 0.05)",
            },
          ]}
        >
          <Text selectable style={[Type.body, { color: theme.incomingText }]}>
            {message.text}
          </Text>
        </View>
      )}
    </Animated.View>
  );
});

export { Ink };

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Space[4],
  },
  rowMine: {
    justifyContent: "flex-end",
  },
  rowTheirs: {
    justifyContent: "flex-start",
    gap: 8,
  },
  avatarSlot: {
    width: BUBBLE_AVATAR,
    height: BUBBLE_AVATAR,
  },
  bubble: {
    maxWidth: "74%",
    borderRadius: Radius.bubble,
    borderCurve: "continuous",
  },
  mine: {
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  theirs: {
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
});
