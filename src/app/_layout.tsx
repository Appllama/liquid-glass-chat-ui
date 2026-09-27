import { Asset } from "expo-asset";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import { preloadOrbImages } from "../cookbooks/fable/components/ui/orb-images";
import { ME, FABLE_TEAM, PEOPLE } from "../cookbooks/fable/data/people";
import { portraits, coast } from "../cookbooks/astra/data";

void SplashScreen.preventAutoHideAsync();

export const unstable_settings = { initialRouteName: "index" };

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    const people = [ME, FABLE_TEAM, ...PEOPLE];
    Promise.allSettled([
      preloadOrbImages(people.map((person) => person.avatar)),
      Asset.loadAsync([
        ...people.map((person) => person.story),
        ...portraits,
        coast,
      ]),
    ]).then(() => {
      if (mounted) setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);
  if (!ready) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <KeyboardProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="fable" />
            <Stack.Screen name="astra" />
          </Stack>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
