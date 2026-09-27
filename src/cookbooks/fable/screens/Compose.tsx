import { router } from "expo-router";
import { useState } from "react";
import { FlashList } from "@shopify/flash-list";
import { Pressable, Text, TextInput, View } from "react-native";
import { Avatar } from "../components/ui/avatar";
import { GlassButton } from "../components/ui/glass-button";
import { PEOPLE } from "../data/people";
import { useTheme } from "../hooks/use-theme";

export default function Compose() {
  const [query, setQuery] = useState("");
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: 28 }}>
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 24,
          alignItems: "center",
          gap: 16,
        }}
      >
        <Text
          style={{
            flex: 1,
            fontSize: 26,
            fontWeight: "600",
            color: theme.label,
          }}
        >
          New message
        </Text>
        <GlassButton
          symbol="xmark"
          accessibilityLabel="Close new message"
          onPress={() => router.back()}
        />
      </View>
      <TextInput
        accessibilityLabel="Find a friend"
        placeholder="Find a friend"
        placeholderTextColor={theme.secondary}
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
        style={{
          margin: 24,
          padding: 16,
          borderRadius: 24,
          borderCurve: "continuous",
          fontSize: 17,
          color: theme.label,
          backgroundColor: theme.surface,
        }}
      />
      <FlashList
        data={PEOPLE.filter((person) =>
          person.name.toLowerCase().includes(query.toLowerCase()),
        )}
        keyExtractor={(person) => person.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Message ${item.name}`}
            onPress={() =>
              router.replace({
                pathname: "/fable/chat/[id]",
                params: { id: item.id },
              })
            }
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              paddingVertical: 12,
            }}
          >
            <Avatar source={item.avatar} size={52} />
            <Text style={{ color: theme.label, fontSize: 17 }}>
              {item.name}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text
            style={{
              color: theme.secondary,
              paddingVertical: 32,
              textAlign: "center",
            }}
          >
            No friends with that name.
          </Text>
        }
      />
    </View>
  );
}
