import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { people } from "../data";
import { useTheme } from "../theme";
import { Avatar, Glass, GlassButton, Icon, tick } from "../ui";
export default function Compose() {
  const t = useTheme(),
    [query, setQuery] = useState("");
  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: 28 }}>
      <View
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          },
          { paddingHorizontal: 24, paddingBottom: 24 },
        ]}
      >
        <Text
          style={{
            fontSize: 26,
            fontWeight: "600",
            letterSpacing: -0.8,
            color: t.text,
          }}
        >
          A little hello.
        </Text>
        <GlassButton
          name="xmark"
          label="Close new message"
          testID="close-compose"
          onPress={() => router.back()}
        />
      </View>
      <View style={{ paddingHorizontal: 24, paddingBottom: 18 }}>
        <Glass
          style={{
            height: 48,
            borderRadius: 24,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            gap: 10,
          }}
        >
          <Icon name="magnifyingglass" size={18} color={t.muted} />
          <TextInput
            accessibilityLabel="Find a friend"
            placeholder="Find a friend"
            placeholderTextColor={t.muted}
            onChangeText={setQuery}
            style={{ flex: 1, height: 48, color: t.text, fontSize: 16 }}
          />
        </Glass>
      </View>
      <FlashList
        data={people.filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase()),
        )}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <Pressable
            testID={`compose-${item.id}`}
            accessibilityLabel={`Message ${item.name}`}
            onPress={() => {
              tick();
              router.replace({
                pathname: "/astra/chat/[id]",
                params: { id: item.id },
              });
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              paddingVertical: 12,
            }}
          >
            <Avatar index={item.avatar} size={52} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontSize: 17, fontWeight: "500", color: t.text }}>
                {item.name}
              </Text>
              <Text style={{ fontSize: 12, color: t.muted }}>
                {item.group ? "Your people" : "In your circle"}
              </Text>
            </View>
            <Icon name="chevron.right" size={13} color={t.muted} />
          </Pressable>
        )}
        ListEmptyComponent={
          <Text
            style={{
              fontSize: 16,
              color: t.muted,
              textAlign: "center",
              paddingTop: 60,
            }}
          >
            No friends with that name.
          </Text>
        }
      />
    </View>
  );
}
