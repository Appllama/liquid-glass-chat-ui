import React from "react";
import { View, Text, ScrollView, Switch, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { useChat } from "../data";
import { useTheme } from "../theme";
import { Glass, GlassButton, Icon, tick } from "../ui";
export default function Settings() {
  const t = useTheme(),
    theme = useChat((s) => s.theme),
    haptics = useChat((s) => s.haptics);
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={{ padding: 24, paddingTop: 28, paddingBottom: 48 }}
    >
      <View
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          },
          { paddingBottom: 28, gap: 20 },
        ]}
      >
        <Text
          style={{
            flex: 1,
            fontSize: 26,
            fontWeight: "600",
            letterSpacing: -0.8,
            color: t.text,
          }}
        >
          {"Make yourself\nat home."}
        </Text>
        <GlassButton
          name="xmark"
          label="Close settings"
          testID="close-settings"
          onPress={() => router.back()}
        />
      </View>
      <Text style={{ fontSize: 13, color: t.muted, paddingBottom: 12 }}>
        APPEARANCE
      </Text>
      <Glass style={{ padding: 6, borderRadius: 26, flexDirection: "row" }}>
        {(["system", "light", "dark"] as const).map((v) => (
          <Pressable
            key={v}
            accessibilityLabel={`${v} appearance`}
            testID={`theme-${v}`}
            onPress={() => {
              tick();
              useChat.getState().setTheme(v);
            }}
            style={{
              flex: 1,
              paddingVertical: 15,
              borderRadius: 22,
              backgroundColor: "transparent",
              alignItems: "center",
            }}
          >
            {v === theme && (
              <Glass
                clear
                tint={t.dark ? "#B9CED54D" : "#667F882C"}
                style={{ position: "absolute", inset: 0, borderRadius: 22 }}
              />
            )}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: t.text,
              }}
            >
              {v[0].toUpperCase() + v.slice(1)}
            </Text>
          </Pressable>
        ))}
      </Glass>
      <Glass
        style={{
          marginTop: 20,
          padding: 18,
          borderRadius: 26,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontSize: 16, color: t.text }}>
          A little haptic feedback
        </Text>
        <Switch
          accessibilityLabel="Haptic feedback"
          value={haptics}
          onValueChange={() => useChat.getState().toggleHaptics()}
          trackColor={{ true: "#555D63" }}
        />
      </Glass>
      <View style={{ gap: 12, paddingTop: 28 }}>
        <Text style={{ fontSize: 18, fontWeight: "600", color: t.text }}>
          Good company. Less noise.
        </Text>
        <Text style={{ fontSize: 14, lineHeight: 21, color: t.muted }}>
          Astra is a little space for your people. This local preview keeps
          messages on your device.
        </Text>
      </View>
      <Pressable
        testID="reset-preview"
        accessibilityLabel="Reset sample conversations"
        onPress={() =>
          Alert.alert(
            "Start fresh?",
            "This resets only the sample conversations stored in Astra.",
            [
              { text: "Keep them", style: "cancel" },
              {
                text: "Reset preview",
                style: "destructive",
                onPress: () => {
                  useChat.getState().reset();
                  router.back();
                },
              },
            ],
          )
        }
        style={{
          paddingVertical: 24,
          flexDirection: "row",
          gap: 10,
          alignItems: "center",
        }}
      >
        <Icon name="arrow.counterclockwise" size={17} />
        <Text style={{ fontSize: 14, color: t.text }}>
          Reset sample conversations
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        testID="all-cookbooks"
        onPress={() => router.dismissTo("/")}
        style={{ paddingVertical: 16 }}
      >
        <Text style={{ color: t.text, fontSize: 17, fontWeight: "600" }}>
          All cookbooks
        </Text>
      </Pressable>
    </ScrollView>
  );
}
