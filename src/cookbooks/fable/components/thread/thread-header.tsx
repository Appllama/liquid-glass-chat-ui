import { router } from "expo-router";
import { Alert, StyleSheet, Text, View } from "react-native";

import { Avatar } from "../ui/avatar";
import { GlassButton } from "../ui/glass-button";
import { Space, Type } from "../../constants/theme";
import type { Person } from "../../data/people";
import { useTheme } from "../../hooks/use-theme";

export const THREAD_NAV_H = 64;

/** The bar: a circle, an identity, a circle. The panel begins right beneath. */
export function ThreadHeader({
  person,
  insetTop,
}: {
  person: Person;
  insetTop: number;
}) {
  const theme = useTheme();
  return (
    <View
      pointerEvents="box-none"
      style={[styles.bar, { top: insetTop, height: THREAD_NAV_H }]}
    >
      <GlassButton
        symbol="chevron.left"
        iconSize={17}
        accessibilityLabel="Back"
        onPress={() => router.back()}
      />
      <View pointerEvents="none" style={styles.center}>
        <Avatar source={person.avatar} size={44} />
        <Text
          numberOfLines={1}
          style={[Type.caption, { color: theme.secondary, marginTop: 4 }]}
        >
          {person.first}
        </Text>
      </View>
      <GlassButton
        symbol="video"
        iconSize={18}
        accessibilityLabel="Video call"
        onPress={() =>
          Alert.alert("Video calls", "Calls are not available in this preview.")
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Space[4],
  },
  center: {
    position: "absolute",
    left: 60,
    right: 60,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
