import { router } from "expo-router";
import { Pressable, Text, View, useColorScheme } from "react-native";

export function NotFound({ home = "/" }: { home?: "/" | "/fable" | "/astra" }) {
  const dark = useColorScheme() === "dark";
  return (
    <View
      style={{
        flex: 1,
        padding: 32,
        gap: 24,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: dark ? "#171819" : "#F2F2F4",
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "600",
          color: dark ? "#F5F5F7" : "#17191B",
        }}
      >
        Conversation not found
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace(home)}
        style={{ padding: 16 }}
      >
        <Text style={{ fontSize: 17, color: dark ? "#91BFFF" : "#0060C9" }}>
          Go back
        </Text>
      </Pressable>
    </View>
  );
}
