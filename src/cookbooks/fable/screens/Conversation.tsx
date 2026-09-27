import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Ref,
} from "react";
import { StyleSheet, Text, View } from "react-native";
import { KeyboardChatScrollView } from "react-native-keyboard-controller";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Bubble } from "../components/thread/bubble";
import { Composer } from "../components/thread/composer";
import { THREAD_NAV_H, ThreadHeader } from "../components/thread/thread-header";
import { TypingBubble } from "../components/thread/typing";
import { Radius, Space, Type } from "../constants/theme";
import { REPLIES, messagesFor } from "../data/messages";
import { PEOPLE_BY_ID } from "../data/people";
import { useTheme } from "../hooks/use-theme";

import { useFable } from "../data/store";
import { NotFound } from "../../NotFound";

export default function ConversationRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return PEOPLE_BY_ID[id] ? (
    <ThreadScreen key={id} id={id} />
  ) : (
    <NotFound home="/fable" />
  );
}

function ThreadScreen({ id }: { id: string }) {
  const person = PEOPLE_BY_ID[id];
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const stored = useFable((state) => state.threads[id]);
  const initial = useMemo(
    () => messagesFor(person.id, person.first),
    [person.id, person.first],
  );
  const messages = stored ?? initial;
  useEffect(() => {
    useFable.getState().markRead(id);
  }, [id]);
  const [typing, setTyping] = useState(false);
  const [mountedCount] = useState(messages.length);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const positioned = useRef(false);
  const initialFrame = useRef<number | null>(null);
  const listRef = useAnimatedRef<Animated.ScrollView>();
  const [composerHeight, setComposerHeight] = useState(0);

  // Include the floating composer in content geometry before the initial scroll.
  // Keyboard Controller supplies only the moving keyboard inset.
  const positionInitially = useCallback(() => {
    if (positioned.current || composerHeight === 0) return;
    positioned.current = true;
    initialFrame.current = requestAnimationFrame(() =>
      listRef.current?.scrollToEnd({ animated: false }),
    );
  }, [composerHeight, listRef]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);
  useEffect(
    () => () => {
      if (initialFrame.current !== null)
        cancelAnimationFrame(initialFrame.current);
    },
    [],
  );

  const scrollToEnd = useCallback(() => {
    const t = setTimeout(
      () => listRef.current?.scrollToEnd({ animated: true }),
      40,
    );
    timers.current.push(t);
  }, [listRef]);

  const onSend = useCallback(
    (text: string, photo = false) => {
      useFable.getState().append(id, text, "me", photo);
      scrollToEnd();
      const t1 = setTimeout(() => {
        setTyping(true);
        scrollToEnd();
      }, 600);
      const t2 = setTimeout(() => {
        setTyping(false);
        const reply =
          REPLIES[
            (useFable.getState().threads[id]?.length ?? 0) % REPLIES.length
          ];
        useFable.getState().append(id, reply, "them");
        Haptics.selectionAsync();
        scrollToEnd();
      }, 1800);
      timers.current.push(t1, t2);
    },
    [scrollToEnd, id],
  );

  const rows = useMemo(
    () =>
      messages.map((msg, i) => {
        const prev = messages[i - 1];
        const next = messages[i + 1];
        const showAvatar =
          msg.from === "them" && (!next || next.from !== "them");
        const first = !prev || prev.from !== msg.from;
        const yesterday = msg.at.startsWith("Yesterday");
        const dayBreak = !prev || prev.at.startsWith("Yesterday") !== yesterday;
        const label = dayBreak ? (yesterday ? "Yesterday" : "Today") : null;
        return { msg, showAvatar, first, label, animate: i >= mountedCount };
      }),
    [messages, mountedCount],
  );

  const panelTop = insets.top + THREAD_NAV_H + Space[1];

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <ThreadHeader person={person} insetTop={insets.top} />

      {/* The panel: one big rounded card the conversation lives in. */}
      <View
        style={[
          styles.panel,
          { top: panelTop, backgroundColor: theme.surface },
        ]}
      >
        <LinearGradient
          pointerEvents="none"
          colors={[theme.surface, theme.panelEnd]}
          locations={[0, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View pointerEvents="none" style={styles.grabberWrap}>
          <View style={[styles.grabber, { backgroundColor: theme.grabber }]} />
        </View>
        <KeyboardChatScrollView
          ref={listRef as unknown as Ref<Animated.ScrollView>}
          // The composer's safe-area padding sits over the keyboard when it is open, so lift by the rest.
          offset={insets.bottom}
          keyboardLiftBehavior="always"
          keyboardDismissMode="interactive"
          contentInsetAdjustmentBehavior="never"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={positionInitially}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: composerHeight + Space[2] },
          ]}
        >
          {rows.map(({ msg, showAvatar, first, label, animate }) => (
            <View key={msg.id}>
              {label && (
                <Text
                  style={[Type.caption, styles.day, { color: theme.tertiary }]}
                >
                  {label}
                </Text>
              )}
              <Bubble
                message={msg}
                person={person}
                showAvatar={showAvatar}
                first={first}
                animate={animate}
              />
            </View>
          ))}
          {typing && <TypingBubble person={person} />}
        </KeyboardChatScrollView>
      </View>

      <Composer
        insetBottom={insets.bottom}
        onSend={onSend}
        onAttach={() => onSend("A moment worth sharing.", true)}
        onLayoutHeight={setComposerHeight}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  panel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -Radius.panel,
    borderRadius: Radius.panel,
    borderCurve: "continuous",
    overflow: "hidden",
    paddingBottom: Radius.panel,
  },
  grabberWrap: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 2,
  },
  grabber: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
  },
  content: {
    paddingTop: Space[6],
  },
  day: {
    textAlign: "center",
    marginTop: Space[5],
  },
});
