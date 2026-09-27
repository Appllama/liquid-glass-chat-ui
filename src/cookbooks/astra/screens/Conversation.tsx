import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Keyboard,
  ActionSheetIOS,
  type ScrollViewProps,
  useWindowDimensions,
} from "react-native";
import { Link, useLocalSearchParams, useIsFocused } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import { GlassContainer } from "expo-glass-effect";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { usePageInsets } from "../insets";
import {
  KeyboardChatScrollView,
  KeyboardStickyView,
  useReanimatedKeyboardAnimation,
} from "react-native-keyboard-controller";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  FadeIn,
  FadeOut,
  useReducedMotion,
} from "react-native-reanimated";
import { people, coast, initialMessages, useChat, type Message } from "../data";
import {
  Avatar,
  Glass,
  GlassButton,
  Icon,
  Button,
  tick,
  impact,
  FadeEdge,
} from "../ui";
import { usePortraitNavigation } from "../flight";
import { useTheme, SNAP } from "../theme";

import { NotFound } from "../../NotFound";

export default function ConversationRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return people.some((person) => person.id === id) ? (
    <Conversation key={id} id={id} />
  ) : (
    <NotFound home="/astra" />
  );
}

function Conversation({ id }: { id: string }) {
  const focused = useIsFocused();
  const person = people.find((p) => p.id === id)!;
  const t = useTheme(),
    insets = usePageInsets(),
    { width, fontScale } = useWindowDimensions();
  const {
    ref: portraitRef,
    back: backPortrait,
    land: landPortrait,
  } = usePortraitNavigation(person);
  const stored = useChat((s) => s.threads[id]),
    messages = stored ?? initialMessages(person.id);
  const muted = useChat((s) => s.muted.includes(id));
  const input = useRef<TextInput>(null),
    draft = useRef(""),
    list = useRef<FlashListRef<Message>>(null);
  const [hasText, setHasText] = useState(false),
    [attachments, setAttachments] = useState(false),
    [reaction, setReaction] = useState<string | null>(null),
    [toast, setToast] = useState("");
  const { progress: keyboardProgress } = useReanimatedKeyboardAnimation();
  const composerPadding = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: (Math.max(insets.bottom, 14) - 8) * keyboardProgress.get(),
      },
    ],
  }));
  const played = useRef(new Set<string>());
  const renderChatScroll = useCallback(
    (props: ScrollViewProps) => (
      <KeyboardChatScrollView
        {...props}
        offset={Math.max(insets.bottom, 14) - 8}
        keyboardLiftBehavior="always"
      />
    ),
    [insets.bottom],
  );
  const sending = useSharedValue(1);
  const reduced = useReducedMotion();
  const sendStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sending.get() }],
  }));
  useEffect(() => {
    if (!focused) return;
    landPortrait();
    // Persist unread state after entry has settled, outside the portrait flight.
    if (useChat.getState().read.includes(id)) return;
    const timer = setTimeout(() => useChat.getState().markRead(id), 700);
    return () => clearTimeout(timer);
  }, [id, focused, landPortrait]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2000);
    return () => clearTimeout(timer);
  }, [toast]);
  const scroll = () =>
    requestAnimationFrame(() => list.current?.scrollToEnd({ animated: true }));
  const send = (kind: "text" | "photo" = "text") => {
    const text = kind === "photo" ? "A little escape." : draft.current.trim();
    if (!text) return;
    useChat.getState().send(id, text, kind);
    draft.current = "";
    input.current?.clear();
    setHasText(false);
    setAttachments(false);
    impact();
    sending.set(
      reduced
        ? 1
        : withSequence(withTiming(0.82, { duration: 70 }), withSpring(1, SNAP)),
    );
    scroll();
  };
  const options = () =>
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [
          muted ? "Unmute conversation" : "Mute conversation",
          "Cancel",
        ],
        cancelButtonIndex: 1,
      },
      (button) => {
        if (button === 0) {
          useChat.getState().toggleMute(id);
          setToast(muted ? "Conversation unmuted" : "Conversation muted");
        }
      },
    );
  const react = (message: string) => {
    useChat.getState().heart(id, message);
    setReaction(null);
    impact();
  };
  return (
    <View key={fontScale} style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar style={t.dark ? "light" : "dark"} />
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 20,
          paddingBottom: 20,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10,
        }}
      >
        <GlassButton
          name="chevron.left"
          label="Back to messages"
          testID="chat-back"
          onPress={backPortrait}
        />
        <Pressable
          onPress={() => {
            tick();
            setToast(
              person.group
                ? "Your Sunday people"
                : `${person.short} is in your circle`,
            );
          }}
          accessibilityLabel={`${person.name}, contact details`}
          style={{ flexDirection: "row", alignItems: "center", gap: 11 }}
        >
          <View ref={portraitRef} collapsable={false} onLayout={landPortrait}>
            <Avatar
              index={person.avatar}
              size={50}
              slot={`header-${person.id}`}
            />
          </View>
          <View style={{ gap: 3 }}>
            <Text
              maxFontSizeMultiplier={1.2}
              numberOfLines={1}
              style={{
                fontSize: 16,
                fontWeight: "600",
                letterSpacing: -0.4,
                color: t.text,
              }}
            >
              {person.name}
            </Text>
            <Text style={{ fontSize: 11, color: t.muted }}>
              {muted
                ? "Notifications muted"
                : person.group
                  ? "4 good people"
                  : "In your circle"}
            </Text>
          </View>
        </Pressable>
        <GlassButton
          name="ellipsis"
          label="Conversation options"
          testID="chat-options"
          onPress={options}
        />
      </View>
      <View style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: "transparent",
          }}
        >
          <FlashList
            ref={list}
            data={messages}
            keyExtractor={(m) => m.id}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 18,
              paddingTop: 22,
              paddingBottom: 20,
            }}
            renderScrollComponent={renderChatScroll}
            onContentSizeChange={scroll}
            ListHeaderComponent={
              <View style={{ alignItems: "center", paddingBottom: 30 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "500",
                    letterSpacing: 0.5,
                    color: t.muted,
                  }}
                >
                  Today
                </Text>
              </View>
            }
            renderItem={({ item, index }) => (
              <Bubble
                message={item}
                index={index}
                avatar={person.avatar}
                maxWidth={width * 0.7}
                played={played.current}
                active={focused}
                onLongPress={() => {
                  Keyboard.dismiss();
                  tick();
                  setReaction(item.id);
                }}
                onHeart={() => react(item.id)}
              />
            )}
            ListFooterComponent={
              messages.at(-1)?.mine ? (
                <View
                  style={{
                    alignItems: "flex-end",
                    paddingTop: 2,
                    paddingRight: 8,
                  }}
                >
                  <Text style={{ fontSize: 11, color: t.muted }}>Just now</Text>
                </View>
              ) : null
            }
          />
          <FadeEdge height={20} />
        </View>
        {!!toast && (
          <Animated.View
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(120)}
            style={{
              position: "absolute",
              top: 12,
              alignSelf: "center",
              zIndex: 30,
            }}
          >
            <Glass
              style={{
                paddingHorizontal: 20,
                paddingVertical: 13,
                borderRadius: 24,
              }}
            >
              <Text style={{ color: t.text, fontSize: 13, fontWeight: "500" }}>
                {toast}
              </Text>
            </Glass>
          </Animated.View>
        )}
        {reaction && (
          <Animated.View
            entering={FadeIn.duration(140)}
            exiting={FadeOut.duration(100)}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 40,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Pressable
              accessibilityLabel="Dismiss reaction menu"
              onPress={() => setReaction(null)}
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "#17191B18",
              }}
            />
            <Glass
              style={{
                flexDirection: "row",
                padding: 8,
                gap: 6,
                borderRadius: 34,
              }}
            >
              <Button
                testID="heart-reaction"
                accessibilityLabel="React with a heart"
                onPress={() => react(reaction)}
                style={{
                  width: 58,
                  height: 52,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="heart.fill" size={28} color={t.text} />
              </Button>
              <Button
                accessibilityLabel="Close reactions"
                onPress={() => setReaction(null)}
                style={{
                  width: 52,
                  height: 52,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="xmark" size={20} />
              </Button>
            </Glass>
          </Animated.View>
        )}
        {attachments && (
          <Animated.View
            entering={FadeIn.duration(180)}
            exiting={FadeOut.duration(100)}
            style={{ paddingHorizontal: 18, paddingTop: 12 }}
          >
            <Glass
              style={{
                padding: 14,
                borderRadius: 28,
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
              }}
            >
              <Pressable
                accessibilityLabel="Send coastal photo"
                testID="send-photo"
                onPress={() => send("photo")}
              >
                <Image
                  source={coast}
                  style={{ width: 84, height: 72, borderRadius: 18 }}
                />
              </Pressable>
              <View style={{ flex: 1, gap: 5 }}>
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: t.text }}
                >
                  A little escape
                </Text>
                <Text style={{ fontSize: 12, color: t.muted }}>
                  Share a moment from the coast.
                </Text>
              </View>
              <GlassButton
                name="arrow.up"
                label="Send coastal photo"
                onPress={() => send("photo")}
                size={44}
              />
            </Glass>
          </Animated.View>
        )}
        <KeyboardStickyView>
          <Animated.View
            style={[
              {
                backgroundColor: "transparent",
                paddingHorizontal: 16,
                paddingTop: 10,
                paddingBottom: Math.max(insets.bottom, 14),
              },
              composerPadding,
            ]}
          >
            <GlassContainer
              spacing={18}
              style={{
                borderRadius: 30,
                minHeight: 60,
                paddingHorizontal: 0,
                paddingVertical: 0,
                flexDirection: "row",
                alignItems: "flex-end",
                gap: 8,
              }}
            >
              <Glass
                clear
                interactive
                style={{
                  flex: 1,
                  minHeight: 58,
                  borderRadius: 29,
                  padding: 7,
                  flexDirection: "row",
                  alignItems: "flex-end",
                  gap: 4,
                }}
              >
                <Button
                  testID="attachments"
                  accessibilityLabel="Share a photo"
                  onPress={() => {
                    tick();
                    Keyboard.dismiss();
                    setAttachments(!attachments);
                  }}
                  style={{
                    width: 44,
                    height: 44,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name={attachments ? "xmark" : "plus"} size={23} />
                </Button>
                <TextInput
                  ref={input}
                  testID="message-input"
                  accessibilityLabel="Message"
                  multiline
                  placeholder="Say something good…"
                  placeholderTextColor={t.muted}
                  onFocus={() => {
                    setAttachments(false);
                  }}
                  onChangeText={(text) => {
                    draft.current = text;
                    const next = !!text.trim();
                    if (next !== hasText) setHasText(next);
                  }}
                  style={{
                    flex: 1,
                    minHeight: 44,
                    maxHeight: 122,
                    fontSize: 16,
                    lineHeight: 22,
                    paddingTop: 11,
                    paddingBottom: 10,
                    color: t.text,
                  }}
                />
              </Glass>
              <Animated.View style={[{ paddingBottom: 3 }, sendStyle]}>
                <Button
                  testID="send"
                  accessibilityLabel="Send message"
                  isDisabled={!hasText}
                  onPress={() => send()}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Glass
                    clear
                    interactive
                    tint={
                      hasText ? (t.dark ? "#B9CED555" : "#71919B40") : undefined
                    }
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon
                      name="arrow.up"
                      size={21}
                      color={hasText ? t.text : t.muted}
                    />
                  </Glass>
                </Button>
              </Animated.View>
            </GlassContainer>
          </Animated.View>
        </KeyboardStickyView>
      </View>
    </View>
  );
}
function Bubble({
  message,
  index,
  avatar,
  maxWidth,
  played,
  onLongPress,
  onHeart,
  active,
}: {
  message: Message;
  index: number;
  avatar: number;
  maxWidth: number;
  played: Set<string>;
  onLongPress: () => void;
  onHeart: () => void;
  active: boolean;
}) {
  const t = useTheme(),
    scale = useSharedValue(1),
    reduced = useReducedMotion();
  const arrival = useSharedValue(reduced || played.has(message.id) ? 1 : 0);
  useLayoutEffect(() => {
    if (!active) return;
    if (!played.has(message.id)) {
      played.add(message.id);
      if (!reduced) {
        arrival.set(0);
        arrival.set(
          withDelay(
            message.id.startsWith("local-") ? 0 : 130 + index * 45,
            withSpring(1, { damping: 23, stiffness: 245, mass: 0.7 }),
          ),
        );
      }
    }
  }, [message.id, index, played, reduced, arrival, active]);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: (1 - arrival.get()) * 36 },
      { scaleX: scale.get() * (0.86 + 0.14 * arrival.get()) },
      { scaleY: scale.get() * (0.78 + 0.22 * arrival.get()) },
    ],
  }));
  const isPhoto = message.kind === "photo";
  return (
    <View
      style={{
        paddingBottom: message.heart ? 28 : 14,
        flexDirection: message.mine ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 8,
        paddingTop: index === 2 ? 8 : 0,
      }}
    >
      {!message.mine && (
        <View style={{ width: 25, marginBottom: 2 }}>
          {(index === 0 || isPhoto || index === 4) && (
            <Avatar index={avatar} size={25} />
          )}
        </View>
      )}
      <Animated.View
        style={[
          { maxWidth, alignSelf: message.mine ? "flex-end" : "flex-start" },
          style,
        ]}
      >
        {isPhoto ? (
          <Link href="/astra/photo" asChild>
            <Pressable
              collapsable={false}
              testID={`message-${message.id}`}
              accessibilityLabel="Open shared coastal photo"
              onLongPress={onLongPress}
              delayLongPress={350}
            >
              <Link.AppleZoom>
                <View
                  collapsable={false}
                  style={{
                    padding: 0,
                    borderRadius: 36,
                    backgroundColor: "transparent",
                    borderCurve: "continuous",
                    boxShadow: [
                      {
                        offsetX: 0,
                        offsetY: 4,
                        blurRadius: 14,
                        color: "#00000009",
                      },
                    ],
                  }}
                >
                  <Image
                    source={coast}
                    contentFit="cover"
                    transition={0}
                    style={{
                      width: maxWidth,
                      height: 200,
                      borderRadius: 36,
                    }}
                  />
                  <Glass
                    clear
                    style={{ position: "absolute", inset: 0, borderRadius: 36 }}
                  />
                  <View style={{ position: "absolute", left: 16, bottom: 16 }}>
                    <Glass
                      clear
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                        borderRadius: 18,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "600",
                          color: "#FFF",
                        }}
                      >
                        A place to disappear
                      </Text>
                    </Glass>
                  </View>
                </View>
              </Link.AppleZoom>
            </Pressable>
          </Link>
        ) : (
          <Pressable
            testID={`message-${message.id}`}
            onLongPress={onLongPress}
            delayLongPress={300}
            onPressIn={() => {
              if (!reduced) scale.set(withTiming(0.98, { duration: 110 }));
            }}
            onPressOut={() => scale.set(withSpring(1, SNAP))}
            accessibilityLabel={message.text}
          >
            <Glass
              clear
              interactive
              tint={
                message.mine
                  ? t.dark
                    ? "#AEC3CD4A"
                    : "#557B862B"
                  : t.dark
                    ? "#FFFFFF18"
                    : "#FFFFFF38"
              }
              style={{
                paddingHorizontal: 18,
                paddingVertical: 14,
                borderRadius: 27,
                borderBottomRightRadius: message.mine ? 15 : 27,
                borderBottomLeftRadius: message.mine ? 27 : 15,
                boxShadow: [
                  {
                    offsetX: 0,
                    offsetY: 5,
                    blurRadius: 15,
                    color: t.dark ? "#00000022" : "#2A373C08",
                  },
                ],
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 22,
                  letterSpacing: -0.2,
                  color: t.text,
                }}
              >
                {message.text}
              </Text>
            </Glass>
          </Pressable>
        )}
        {message.heart && (
          <Animated.View
            entering={FadeIn.duration(180)}
            style={{ position: "absolute", right: 10, bottom: -16 }}
          >
            <Pressable
              onPress={onHeart}
              accessibilityLabel="Remove heart reaction"
              hitSlop={8}
            >
              <Glass
                style={{
                  width: 37,
                  height: 30,
                  borderRadius: 15,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="heart.fill" size={16} />
              </Glass>
            </Pressable>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}
