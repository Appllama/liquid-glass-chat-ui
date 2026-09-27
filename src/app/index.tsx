import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SymbolView } from "expo-symbols";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COOKBOOKS } from "../cookbooks/registry";

const previews = {
  fable: [
    require("../../assets/cookbooks/fable/avatars/mara.jpg"),
    require("../../assets/cookbooks/fable/avatars/theo.jpg"),
    require("../../assets/cookbooks/fable/avatars/elena.jpg"),
  ],
  astra: [
    require("../../assets/cookbooks/astra/portraits/0.png"),
    require("../../assets/cookbooks/astra/portraits/1.png"),
    require("../../assets/cookbooks/astra/portraits/2.png"),
  ],
};

export default function Gallery() {
  const dark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();
  const ink = dark ? "#F5F5F7" : "#17191B";
  const secondary = dark ? "#A5A9AE" : "#64686E";
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: dark ? "#171819" : "#F2F2F4" }}
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={{
        padding: 24,
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 24,
      }}
    >
      <StatusBar style={dark ? "light" : "dark"} />
      <Image
        source={
          dark
            ? require("../../docs/images/appllama-logo-dark.png")
            : require("../../docs/images/appllama-logo-light.png")
        }
        contentFit="contain"
        style={{ width: 150, height: 45 }}
        accessibilityLabel="Appllama"
      />
      <Text accessibilityRole="header" style={[styles.title, { color: ink }]}>
        Liquid Glass{"\n"}Chat UI
      </Text>
      <Text style={[styles.intro, { color: secondary }]}>
        Two chat cookbooks. Open one, pull down the portraits, and start a
        conversation.
      </Text>
      <View style={{ marginTop: 36 }}>
        {COOKBOOKS.map((cookbook) => (
          <Pressable
            key={cookbook.id}
            testID={`open-${cookbook.id}`}
            accessibilityRole="button"
            accessibilityLabel={cookbook.title}
            onPress={() => router.push(cookbook.route)}
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: pressed
                  ? dark
                    ? "#252729"
                    : "#E7E7EA"
                  : "transparent",
                borderTopColor: dark ? "#35373A" : "#D9DADD",
              },
            ]}
          >
            <View style={styles.portraits}>
              {previews[cookbook.id].map((source, index) => (
                <Image
                  key={index}
                  source={source}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    marginLeft: index ? -12 : 0,
                    borderWidth: 2,
                    borderColor: dark ? "#171819" : "#F2F2F4",
                  }}
                />
              ))}
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Text style={[styles.name, { color: ink }]}>
                {cookbook.title}
              </Text>
              <SymbolView name="arrow.up.right" size={19} tintColor={ink} />
            </View>
            <Text style={[styles.description, { color: secondary }]}>
              {cookbook.description}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={[styles.footer, { color: secondary }]}>
        A local UI playground by Appllama.
      </Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  title: {
    fontSize: 42,
    lineHeight: 46,
    fontWeight: "700",
    letterSpacing: -1.8,
    marginTop: 32,
  },
  intro: { fontSize: 17, lineHeight: 25, marginTop: 16 },
  row: {
    paddingVertical: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderCurve: "continuous",
  },
  portraits: { flexDirection: "row", marginBottom: 16 },
  name: { flex: 1, fontSize: 21, fontWeight: "600", letterSpacing: -0.5 },
  description: { marginTop: 8, fontSize: 15, lineHeight: 22 },
  footer: { fontSize: 12, marginTop: 28 },
});
