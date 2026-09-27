import { LinearGradient } from "expo-linear-gradient";
import { SymbolView } from "expo-symbols";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
  type SharedValue,
} from "react-native-reanimated";

import { GlassButton } from "../ui/glass-button";
import { Orb } from "../ui/orb";
import { OrbButton } from "../ui/orb-button";
import { Accent, Type } from "../../constants/theme";
import { ME, type Person } from "../../data/people";
import { useStorySeen } from "../../data/story-state";
import { useTheme } from "../../hooks/use-theme";

/** Geometry — every number here is shared with the list screen. */
export const NAV_H = 52;
export const STORIES_H = 104;
export const AV = 64; // expanded avatar
export const GAP = 12;
export const PAD = 16;
export const MINI = 26; // collapsed avatar in the title cluster
export const MINI_STEP = 17; // horizontal step between cluster avatars
export const CLUSTER_COUNT = 3;
const CLUSTER_W = MINI + (CLUSTER_COUNT - 1) * MINI_STEP;
const TITLE_GAP = 8;
const RING = 2.5;
const RING_GAP = 2.5;

const easeOut = Easing.out(Easing.cubic);
const easeInOut = Easing.inOut(Easing.cubic);

type Props = {
  progress: SharedValue<number>; // 0 collapsed → 1 expanded, finger-driven
  stretch: SharedValue<number>; // overscroll beyond expanded, in points
  stories: Person[];
  width: number;
  insetTop: number;
  isOpen: boolean;
  onPressCluster: () => void;
  onPressStory: (person: Person) => void;
  onPressCompose: () => void;
  onPressMe: () => void;
};

export function StoriesHeader({
  progress,
  stretch,
  stories,
  width,
  insetTop,
  isOpen,
  onPressCluster,
  onPressStory,
  onPressCompose,
  onPressMe,
}: Props) {
  const theme = useTheme();
  const [titleWidth, setTitleWidth] = useState(48);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const sx = useScrollOffset(scrollRef);

  // Once tucked away, quietly rewind the rail so the cluster is always the first three.
  useEffect(() => {
    if (!isOpen) scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [isOpen, scrollRef]);

  const groupW = CLUSTER_W + TITLE_GAP + titleWidth;
  const clusterLeft = (width - groupW) / 2;
  const clusterCY = insetTop + NAV_H / 2;
  const slotCY = insetTop + NAV_H + 8 + AV / 2;
  const titleShift = (CLUSTER_W + TITLE_GAP) / 2;

  const titleStyle = useAnimatedStyle(() => {
    const p = progress.get();
    const px = easeInOut(interpolate(p, [0.1, 1], [0, 1], Extrapolation.CLAMP));
    return { transform: [{ translateX: (1 - px) * titleShift }] };
  });

  // The collapsed cluster is tappable: it re-opens the row.
  const clusterHitStyle = useAnimatedStyle(() => ({
    opacity: progress.get() < 0.5 ? 1 : 0,
  }));

  return (
    <View
      pointerEvents="box-none"
      style={[styles.root, { height: insetTop + NAV_H + STORIES_H }]}
      accessibilityRole="header"
    >
      {/* Backdrop: solid under the bar, fading tail so rows slide under, not cut. */}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { height: insetTop + NAV_H, backgroundColor: theme.bg },
        ]}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[theme.bg, `${theme.bg}00`]}
        style={{
          position: "absolute",
          top: insetTop + NAV_H,
          left: 0,
          right: 0,
          height: 28,
        }}
      />

      {/* Stories rail — full overlay height so avatars can travel up into the bar unclipped. */}
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pointerEvents={isOpen ? "auto" : "none"}
        scrollEnabled={isOpen}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        style={[StyleSheet.absoluteFill]}
        contentContainerStyle={{
          paddingTop: insetTop + NAV_H + 8,
          paddingHorizontal: PAD,
          gap: GAP,
        }}
      >
        {stories.map((person, i) => (
          <StoryItem
            key={person.id}
            person={person}
            index={i}
            progress={progress}
            stretch={stretch}
            sx={sx}
            clusterLeft={clusterLeft}
            clusterCY={clusterCY}
            slotCY={slotCY}
            isOpen={isOpen}
            onPress={() => onPressStory(person)}
          />
        ))}
      </Animated.ScrollView>

      {/* Bar */}
      <View
        pointerEvents="box-none"
        style={[styles.bar, { top: insetTop, height: NAV_H }]}
      >
        <OrbButton
          source={ME.avatar}
          size={40}
          accessibilityLabel="Your profile"
          onPress={onPressMe}
        />
        <View pointerEvents="box-none" style={styles.titleWrap}>
          <Animated.Text
            onLayout={(e) =>
              setTitleWidth(Math.round(e.nativeEvent.layout.width))
            }
            style={[Type.navTitle, { color: theme.label }, titleStyle]}
            accessibilityRole="header"
          >
            Chats
          </Animated.Text>
        </View>
        <GlassButton
          symbol="plus"
          iconSize={20}
          accessibilityLabel="New message"
          onPress={onPressCompose}
        />
        {!isOpen && (
          <Animated.View
            style={[
              styles.clusterHit,
              clusterHitStyle,
              {
                left: clusterLeft - 8,
                top: (NAV_H - 44) / 2,
                width: CLUSTER_W + 16,
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Show stories"
              onPress={onPressCluster}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        )}
      </View>
    </View>
  );
}

type ItemProps = {
  person: Person;
  index: number;
  progress: SharedValue<number>;
  stretch: SharedValue<number>;
  sx: SharedValue<number>;
  clusterLeft: number;
  clusterCY: number;
  slotCY: number;
  isOpen: boolean;
  onPress: () => void;
};

function StoryItem({
  person,
  index,
  progress,
  stretch,
  sx,
  clusterLeft,
  clusterCY,
  slotCY,
  isOpen,
  onPress,
}: ItemProps) {
  const theme = useTheme();
  const isMe = index === 0;
  const clusterK = index - 1; // 0..2 for the three that tuck into the title
  const inCluster = clusterK >= 0 && clusterK < CLUSTER_COUNT;
  const slotCX = PAD + index * (AV + GAP) + AV / 2;
  const clusterMidCX = clusterLeft + CLUSTER_W / 2;
  const targetCX = inCluster
    ? clusterLeft + clusterK * MINI_STEP + MINI / 2
    : clusterMidCX;

  const avatarStyle = useAnimatedStyle(() => {
    const p = progress.get();
    const s = stretch.get();
    const py = easeOut(interpolate(p, [0, 0.6], [0, 1], Extrapolation.CLAMP));
    const px = easeInOut(
      interpolate(p, [0.12, 1], [0, 1], Extrapolation.CLAMP),
    );
    const screenCX = slotCX - sx.get();
    const dx = targetCX - screenCX;
    const dy = clusterCY - slotCY;
    const pull = s * 0.45; // rubber-band follows the finger past open
    if (inCluster) {
      const scale = MINI / AV + (1 - MINI / AV) * easeOut(p);
      return {
        opacity: 1,
        transform: [
          { translateX: (1 - px) * dx },
          { translateY: (1 - py) * dy + pull },
          { scale: scale * (1 + s / 900) },
        ],
      };
    }
    // Everyone else emerges from behind the cluster.
    const travel = isMe ? 0.5 : 0.35;
    return {
      opacity: interpolate(p, [0.3, 0.78], [0, 1], Extrapolation.CLAMP),
      transform: [
        { translateX: (1 - px) * dx * travel },
        { translateY: (1 - py) * dy + pull },
        { scale: (0.55 + 0.45 * easeOut(p)) * (1 + s / 900) },
      ],
    };
  });

  // Extra ring in bg color so overlapping cluster avatars stay separated.
  const separatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.get(),
      [0.35, 0.7],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const labelStyle = useAnimatedStyle(() => {
    const p = progress.get();
    return {
      opacity: interpolate(p, [0.55, 1], [0, 1], Extrapolation.CLAMP),
      transform: [{ translateY: (1 - p) * 10 + stretch.get() * 0.45 }],
    };
  });

  const seenNow = useStorySeen(person.id);
  const state =
    seenNow && person.storyState !== "none" ? "seen" : person.storyState;
  const ringColor =
    state === "unread"
      ? Accent
      : state === "seen"
        ? theme.seenRing
        : "transparent";
  // A seen story keeps only a hairline, so the orb reads as glass, not as a bezel.
  const ringWidth = state === "seen" ? 1.25 : RING;
  const inner = AV - 2 * (RING + RING_GAP);

  return (
    <Pressable
      onPress={onPress}
      disabled={!isOpen}
      accessibilityRole="button"
      accessibilityLabel={isMe ? "Add to your story" : `${person.name}'s story`}
      style={[styles.item, { zIndex: inCluster ? 100 - index : 50 - index }]}
    >
      <Animated.View style={[styles.avatarBox, avatarStyle]}>
        <Animated.View
          pointerEvents="none"
          style={[styles.separator, separatorStyle, { borderColor: theme.bg }]}
        />
        {isMe ? (
          <View
            style={[styles.add, { backgroundColor: theme.chip }]}
            accessibilityElementsHidden
          >
            <SymbolView
              name="plus"
              size={26}
              weight="medium"
              tintColor={theme.label}
            />
          </View>
        ) : (
          <View
            style={[
              styles.ring,
              {
                borderColor: ringColor,
                borderWidth: ringWidth,
                padding: RING - ringWidth,
              },
            ]}
          >
            <Orb source={person.avatar} size={inner} />
          </View>
        )}
      </Animated.View>
      <Animated.Text
        numberOfLines={1}
        style={[
          Type.caption,
          styles.label,
          { color: theme.secondary },
          labelStyle,
        ]}
      >
        {person.first}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: PAD,
    justifyContent: "space-between",
  },
  titleWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  clusterHit: {
    position: "absolute",
    height: 44,
  },
  item: {
    width: AV,
    alignItems: "center",
  },
  avatarBox: {
    width: AV,
    height: AV,
    alignItems: "center",
    justifyContent: "center",
  },
  separator: {
    position: "absolute",
    width: AV + 8,
    height: AV + 8,
    borderRadius: (AV + 8) / 2,
    borderWidth: 4,
    top: -4,
    left: -4,
  },
  ring: {
    width: AV,
    height: AV,
    borderRadius: AV / 2,
    borderWidth: RING,
    alignItems: "center",
    justifyContent: "center",
  },
  add: {
    width: AV,
    height: AV,
    borderRadius: AV / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    marginTop: 6,
    maxWidth: AV + 8,
  },
});
