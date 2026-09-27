import { router } from "expo-router";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Avatar } from "../ui/avatar";
import { Accent, Space, Type } from "../../constants/theme";
import type { Chat } from "../../data/chats";
import { PEOPLE_BY_ID } from "../../data/people";
import { useFable } from "../../data/store";
import { useTheme } from "../../hooks/use-theme";

export const ROW_AVATAR = 60;

/** Avatar, name, preview, and an unread indicator. */
export const ChatRow = memo(function ChatRow({ chat }: { chat: Chat }) {
  const theme = useTheme();
  const person = PEOPLE_BY_ID[chat.personId];
  const read = useFable((state) => state.read.includes(chat.id));
  const last = useFable((state) => state.threads[chat.id]?.at(-1));
  const unread = chat.unread > 0 && !read;
  const preview = last
    ? last.photo
      ? "Shared a photo"
      : last.text
    : chat.preview;
  const fromMe = last ? last.from === "me" : chat.fromMe;

  return (
    <Pressable
      testID={`fable-chat-${chat.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${person.name}${unread ? ", unread" : ""}. ${preview}`}
      onPress={() =>
        router.push({ pathname: "/fable/chat/[id]", params: { id: chat.id } })
      }
      unstable_pressDelay={90}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? theme.rowPressed : "transparent" },
      ]}
    >
      <Avatar source={person.avatar} size={ROW_AVATAR} />
      <View style={styles.body}>
        <Text numberOfLines={1} style={[Type.name, { color: theme.label }]}>
          {person.name}
        </Text>
        <Text
          numberOfLines={1}
          style={[
            Type.preview,
            { color: unread ? theme.label : theme.secondary },
          ]}
        >
          {fromMe ? "You: " : ""}
          {preview}
        </Text>
      </View>
      <View style={styles.meta}>
        {unread && <View style={styles.dot} accessibilityLabel="Unread" />}
        <Text style={[Type.meta, styles.time, { color: theme.secondary }]}>
          {last ? "now" : chat.time}
        </Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Space[4],
    paddingHorizontal: Space[5],
    paddingVertical: Space[3],
    borderRadius: 28,
    borderCurve: "continuous",
    marginHorizontal: Space[2],
  },
  body: {
    flex: 1,
    gap: 3,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: Space[2],
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: Accent,
  },
  time: {
    fontVariant: ["tabular-nums"],
  },
});
