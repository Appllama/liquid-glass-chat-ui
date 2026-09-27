import { Stack } from "expo-router";
import { GlassFlight } from "../../cookbooks/astra/GlassFlight";
import { useTheme } from "../../cookbooks/astra/theme";

export const unstable_settings = { initialRouteName: "index" };
export default function AstraLayout() {
  const theme = useTheme();
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.bg },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="chat/[id]"
          dangerouslySingular={(_name, params) => String(params.id)}
          options={{ animation: "fade", animationDuration: 220 }}
        />
        <Stack.Screen
          name="compose"
          options={{
            presentation: "formSheet",
            sheetAllowedDetents: [0.75, 1],
            sheetGrabberVisible: true,
            sheetCornerRadius: 36,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            presentation: "formSheet",
            sheetAllowedDetents: [0.65, 1],
            sheetGrabberVisible: true,
            sheetCornerRadius: 36,
          }}
        />
        <Stack.Screen name="photo" options={{ gestureEnabled: false }} />
      </Stack>
      <GlassFlight />
    </>
  );
}
