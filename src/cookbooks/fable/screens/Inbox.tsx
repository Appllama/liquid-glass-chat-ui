import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useCallback, useRef, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  FadeInDown,
  runOnJS,
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedProps,
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChatRow } from "../components/chats/chat-row";
import {
  NAV_H,
  STORIES_H,
  StoriesHeader,
} from "../components/chats/stories-header";
import { EASE_OUT } from "../constants/motion";
import { Space } from "../constants/theme";
import { CHATS } from "../data/chats";
import { STORIES, type Person } from "../data/people";
import { openStory } from "../data/story-state";
import { useTheme } from "../hooks/use-theme";

const tick = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

/** A drag that begins this far below the closed title locks the rail zone out. */
const LOCK_BELOW = STORIES_H + 40;

/**
 * The stories rail is the first 104pt of the list's content, hidden under the
 * title when the list rests at 104. Pulling from there draws the orbs out of
 * the title and a release snaps to whichever end is nearer.
 *
 * A drag that starts anywhere further down first locks that zone away with a
 * negative top inset, so a fling can only ever land on the closed title (with
 * the scroll view's own bounce). The lock lifts once the list comes to rest at
 * the title again. The inset only changes at those quiet moments, never while
 * a snap or a bounce is in flight.
 */
export default function ChatsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const listRef = useAnimatedRef<Animated.ScrollView>();
  const [isOpen, setIsOpen] = useState(false);
  const positioned = useRef(false);

  const y = useSharedValue(STORIES_H);
  const lockedSV = useSharedValue(false);
  const dragStart = useSharedValue(STORIES_H);
  const settling = useSharedValue(false); // a snap we issued is in flight

  // While locked, the only way into the rail zone is the scroll view's bounce
  // after a fling to the top; show it as a hint, not a half-open rail.
  const progress = useDerivedValue(() => {
    const p = 1 - Math.min(1, Math.max(0, y.get() / STORIES_H));
    return lockedSV.get() ? p * 0.25 : p;
  });
  const stretch = useDerivedValue(() => Math.max(0, -y.get()));

  // JS state and a haptic exactly once per crossing of the midpoint.
  useAnimatedReaction(
    () => progress.get() > 0.5,
    (open, prev) => {
      if (prev !== null && open !== prev) {
        runOnJS(setIsOpen)(open);
        runOnJS(tick)();
      }
    },
  );

  // The lock is a UI-thread prop: flipping it never re-renders the screen mid-scroll.
  const lock = (on: boolean) => {
    "worklet";
    if (lockedSV.get() === on) return;
    lockedSV.set(on);
  };
  const lockProps = useAnimatedProps(() => ({
    contentInset: {
      top: lockedSV.get() ? -STORIES_H : 0,
      left: 0,
      bottom: 0,
      right: 0,
    },
  }));

  const snap = (yy: number, pulledDown: boolean) => {
    "worklet";
    const target = pulledDown
      ? yy < STORIES_H * 0.8
        ? 0
        : STORIES_H
      : yy > STORIES_H * 0.2
        ? STORIES_H
        : 0;
    settling.set(true);
    scrollTo(listRef, 0, target, true);
  };

  const onScroll = useAnimatedScrollHandler({
    onBeginDrag: (e) => {
      dragStart.set(e.contentOffset.y);
      settling.set(false);
    },
    onScroll: (e) => {
      const yy = e.contentOffset.y;
      y.set(yy);
      // Lock as soon as the list is well below the title, long before any fling back up.
      if (yy > LOCK_BELOW) lock(true);
    },
    onEndDrag: (e) => {
      const yy = e.contentOffset.y;
      if (lockedSV.get()) {
        if (yy <= STORIES_H + 1 && Math.abs(e.velocity?.y ?? 0) < 0.01)
          lock(false);
        return;
      }
      if (yy <= 0 || yy >= STORIES_H) return;
      snap(yy, yy < dragStart.get());
    },
    onMomentumEnd: (e) => {
      const yy = e.contentOffset.y;
      if (settling.get()) {
        settling.set(false);
        return;
      }
      if (lockedSV.get()) {
        if (yy <= STORIES_H + 1) lock(false);
        return;
      }
      if (yy > 0 && yy < STORIES_H) snap(yy, yy < dragStart.get());
    },
  });

  const openStories = useCallback(() => {
    lockedSV.set(false);
    requestAnimationFrame(() =>
      listRef.current?.scrollTo({ x: 0, y: 0, animated: true }),
    );
  }, [listRef, lockedSV]);

  const onPressStory = useCallback((person: Person) => openStory(person), []);

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <Animated.ScrollView
        ref={listRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        animatedProps={lockProps}
        contentInsetAdjustmentBehavior="never"
        scrollIndicatorInsets={{ top: insets.top + NAV_H }}
        onContentSizeChange={(_, h) => {
          // Start closed. The contentOffset prop is clamped before content exists, so do it here, once.
          if (!positioned.current && h > 0) {
            positioned.current = true;
            listRef.current?.scrollTo({ x: 0, y: STORIES_H, animated: false });
          }
        }}
        contentContainerStyle={{
          paddingTop: insets.top + NAV_H,
          paddingBottom: insets.bottom + Space[6],
        }}
      >
        <View style={{ height: STORIES_H }} />
        {CHATS.map((chat, i) => (
          <Animated.View
            key={chat.id}
            entering={FadeInDown.delay(Math.min(i, 8) * 34)
              .duration(300)
              .easing(EASE_OUT.factory())}
          >
            <ChatRow chat={chat} />
          </Animated.View>
        ))}
      </Animated.ScrollView>

      <StoriesHeader
        progress={progress}
        stretch={stretch}
        stories={STORIES}
        width={width}
        insetTop={insets.top}
        isOpen={isOpen}
        onPressCluster={openStories}
        onPressStory={onPressStory}
        onPressCompose={() => router.push("/fable/compose")}
        onPressMe={() => router.push("/fable/settings")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
