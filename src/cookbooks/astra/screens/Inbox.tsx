import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  TextInput,
  useWindowDimensions,
  Keyboard,
  type ScrollViewProps,
} from "react-native";
import { router, useIsFocused } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { FlashList } from "@shopify/flash-list";
import { usePageInsets } from "../insets";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  Pressable,
} from "react-native-gesture-handler";
import { usePortraitNavigation } from "../flight";
import { CircleRail } from "../CircleRail";
import { CIRCLE_TRAVEL, useCircleMotion, useCirclePan } from "../circleMotion";
import {
  Avatar,
  Glass,
  GlassButton,
  Icon,
  tick,
  FadeEdge,
  Button,
} from "../ui";
import { people, useChat, type Person } from "../data";
import { useTheme } from "../theme";

export default function Inbox() {
  const t = useTheme(),
    insets = usePageInsets(),
    { width, fontScale } = useWindowDimensions();
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState("All"),
    [expanded, setExpanded] = useState(false);
  const read = useChat((s) => s.read),
    threads = useChat((s) => s.threads),
    muted = useChat((s) => s.muted);
  const motion = useCircleMotion(setExpanded);
  const { progress: p, destination, settle } = motion;
  const scrollY = useSharedValue(0);
  const search = useRef<TextInput>(null);
  const toggle = () => {
    if (motion.suppressTap.get()) {
      motion.suppressTap.set(false);
      return;
    }
    Keyboard.dismiss();
    settle(destination.get() === 1 ? 0 : 1, 0, true);
  };
  const panel = useAnimatedStyle(() => ({
    transform: [{ translateY: CIRCLE_TRAVEL * p.get() }],
  }));

  const chevron = useAnimatedStyle(() => ({
    transform: [{ rotate: `${Math.max(0, Math.min(1, p.get())) * 180}deg` }],
  }));
  const circleLabel = useAnimatedStyle(() => ({
    opacity: interpolate(p.get(), [0.68, 0.94], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(
          p.get(),
          [0.68, 1],
          [3, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));
  const nativeGesture = useMemo(() => Gesture.Native(), []);
  const renderInboxScroll = useCallback(
    (props: ScrollViewProps) => (
      <GestureDetector gesture={nativeGesture}>
        <Animated.ScrollView {...props} />
      </GestureDetector>
    ),
    [nativeGesture],
  );
  const pan = useCirclePan(motion, scrollY).simultaneousWithExternalGesture(
    nativeGesture,
  );
  const headerPan = useCirclePan(motion);
  const rows = useMemo(
    () =>
      people.filter(
        (person) =>
          (["mira", "weekend", "zora", "kenji"].includes(person.id) ||
            read.includes(person.id)) &&
          (filter !== "Unread" ||
            (person.unread && !read.includes(person.id))) &&
          (filter !== "Groups" || person.group) &&
          `${person.name} ${person.preview}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [filter, read, query],
  );

  return (
    <View key={fontScale} style={[{ flex: 1 }, { backgroundColor: t.bg }]}>
      <PreloadRoutes firstConversation={rows[0]?.id} />
      <StatusBar style={t.dark ? "light" : "dark"} />
      <View
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          },
          {
            paddingTop: insets.top + 8,
            paddingHorizontal: 24,
            height: insets.top + 68,
            gap: 16,
          },
        ]}
      >
        <Pressable
          accessibilityLabel="Open Astra settings"
          testID="settings"
          onPress={() => router.push("/astra/settings")}
          hitSlop={12}
          style={{ flex: 1 }}
        >
          <Text
            maxFontSizeMultiplier={1.1}
            style={{
              fontSize: 27,
              fontWeight: "700",
              letterSpacing: -1.0,
              color: t.text,
              fontFamily: "System",
            }}
          >
            Messages
          </Text>
        </Pressable>
        <GestureDetector gesture={headerPan}>
          <Pressable
            accessibilityLabel={
              expanded ? "Collapse your circle" : "Expand your circle"
            }
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            testID="toggle-circle"
            onPress={toggle}
            style={{
              width: 116,
              height: 44,
            }}
          >
            <Animated.View
              style={[
                {
                  position: "absolute",
                  left: 0,
                  right: 30,
                  top: 0,
                  bottom: 0,
                  justifyContent: "center",
                  alignItems: "flex-end",
                },
                circleLabel,
              ]}
            >
              <Text
                numberOfLines={1}
                style={{ fontSize: 11, fontWeight: "500", color: t.muted }}
              >
                Your circle
              </Text>
            </Animated.View>
            <Animated.View
              style={[{ position: "absolute", right: 10, top: 16 }, chevron]}
            >
              <Icon name="chevron.down" size={12} />
            </Animated.View>
          </Pressable>
        </GestureDetector>
        <GlassButton
          name="plus"
          label="New message"
          size={44}
          testID="compose"
          onPress={() => router.push("/astra/compose")}
        />
      </View>

      <CircleRail
        motion={motion}
        width={width}
        top={insets.top + 20}
        onToggle={toggle}
      />
      <GestureDetector gesture={pan}>
        <Animated.View style={[{ flex: 1 }, panel]}>
          <View style={{ height: 14 }} />
          <View style={{ paddingHorizontal: 24 }}>
            <Glass
              style={{
                height: 44,
                borderRadius: 22,
                paddingHorizontal: 16,
                flexDirection: "row",
                gap: 10,
                alignItems: "center",
              }}
            >
              <Icon name="magnifyingglass" size={18} color={t.muted} />
              <TextInput
                ref={search}
                testID="search"
                accessibilityLabel="Search conversations"
                placeholder="Find a conversation"
                placeholderTextColor={t.muted}
                onChangeText={setQuery}
                autoCorrect={false}
                returnKeyType="search"
                style={{ flex: 1, fontSize: 14, color: t.text, height: 44 }}
              />
              {!!query && (
                <Pressable
                  onPress={() => {
                    search.current?.clear();
                    setQuery("");
                  }}
                  hitSlop={14}
                  accessibilityLabel="Clear search"
                >
                  <Icon name="xmark.circle.fill" size={18} color={t.muted} />
                </Pressable>
              )}
            </Glass>
          </View>
          <View
            style={[
              { flexDirection: "row", gap: 8 },
              { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
            ]}
          >
            {["All", "Unread", "Groups"].map((tab) => (
              <Button
                key={tab}
                accessibilityLabel={`${tab} conversations`}
                testID={`filter-${tab}`}
                hitSlop={6}
                accessibilityRole="tab"
                accessibilityState={{ selected: tab === filter }}
                onPress={() => {
                  tick();
                  setFilter(tab);
                }}
                style={{ height: 36 }}
              >
                <Glass
                  interactive
                  clear
                  tint={
                    tab === filter
                      ? t.dark
                        ? "#B9CED54D"
                        : "#667F882C"
                      : undefined
                  }
                  style={{
                    paddingHorizontal: 18,
                    height: 36,
                    borderRadius: 18,
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: tab === filter ? "600" : "500",
                      color: tab === filter ? t.text : t.muted,
                    }}
                  >
                    {tab}
                  </Text>
                </Glass>
              </Button>
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <FlashList
              bounces={false}
              scrollEnabled={!expanded}
              onScroll={(e) => scrollY.set(e.nativeEvent.contentOffset.y)}
              renderScrollComponent={renderInboxScroll}
              data={rows}
              keyExtractor={(p) => p.id}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 170,
                paddingHorizontal: 16,
              }}
              renderItem={({ item }) => (
                <ChatRow
                  person={item}
                  unread={!!item.unread && !read.includes(item.id)}
                  muted={muted.includes(item.id)}
                  preview={(() => {
                    const last = threads[item.id]?.at(-1);
                    if (!last) return undefined;
                    return `${last.mine ? "You: " : ""}${last.kind === "photo" ? "Shared a photo" : last.text}`;
                  })()}
                />
              )}
              ListEmptyComponent={
                <View
                  style={[
                    { alignItems: "center" },
                    { paddingTop: 72, paddingHorizontal: 32, gap: 14 },
                  ]}
                >
                  <Icon
                    name="bubble.left.and.bubble.right"
                    size={34}
                    color={t.muted}
                  />
                  <Text
                    style={{ fontSize: 19, fontWeight: "600", color: t.text }}
                  >
                    {query
                      ? "No conversations found"
                      : "A little peace and quiet."}
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      lineHeight: 22,
                      textAlign: "center",
                      color: t.muted,
                    }}
                  >
                    {query
                      ? "Try a name or a few different words."
                      : "You’re all caught up. Make someone’s day with a hello."}
                  </Text>
                </View>
              }
            />
            <FadeEdge height={8} />
          </View>
        </Animated.View>
      </GestureDetector>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: insets.bottom + 36,
        }}
      >
        <FadeEdge bottom height={insets.bottom + 36} />
      </View>
    </View>
  );
}
function ChatRow({
  person,
  unread,
  muted,
  preview,
}: {
  person: Person;
  unread: boolean;
  muted: boolean;
  preview?: string;
}) {
  const t = useTheme();
  const { ref: portraitRef, open: openPortrait } = usePortraitNavigation(
    person,
    "row",
  );
  return (
    <Pressable
      collapsable={false}
      testID={`chat-${person.id}`}
      accessibilityLabel={`${person.name}, ${preview ?? person.preview}${unread ? ", unread" : ""}`}
      onPress={() => {
        tick();
        openPortrait();
      }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 18,
        gap: 18,
        borderRadius: 24,
      }}
    >
      <View
        ref={portraitRef}
        collapsable={false}
        style={{ width: 62, height: 62 }}
      >
        <Avatar
          index={person.avatar}
          size={62}
          online={person.online}
          slot={`row-${person.id}`}
        />
      </View>
      <View style={[{ flex: 1 }, { gap: 6 }]}>
        <View
          style={[{ flexDirection: "row", alignItems: "center" }, { gap: 8 }]}
        >
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontSize: 16,
              fontWeight: unread ? "600" : "500",
              letterSpacing: -0.25,
              color: t.text,
            }}
          >
            {person.name}
          </Text>
          <Text style={{ fontSize: 11, color: unread ? t.text : t.muted }}>
            {preview ? "now" : person.time}
          </Text>
        </View>
        <View
          style={[{ flexDirection: "row", alignItems: "center" }, { gap: 10 }]}
        >
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontSize: 14,
              lineHeight: 19,
              color: unread ? t.text : t.muted,
            }}
          >
            {preview ?? person.preview}
          </Text>
          {unread ? (
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: t.blue,
              }}
            />
          ) : muted ? (
            <Icon name="bell.slash.fill" size={11} color={t.muted} />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

// Focus changes should prepare routes without re-rendering the glass inbox.
function PreloadRoutes({ firstConversation }: { firstConversation?: string }) {
  const focused = useIsFocused();
  useEffect(() => {
    if (!focused || !firstConversation) return;
    // Native-stack prepares the most likely next screen before a row is tapped.
    // Re-prime it after returning, when the preceding transition has settled.
    const timer = setTimeout(() => {
      router.prefetch({
        pathname: "/astra/chat/[id]",
        params: { id: firstConversation },
      });
      router.prefetch("/astra/compose");
    }, 450);
    return () => clearTimeout(timer);
  }, [focused, firstConversation]);

  return null;
}
