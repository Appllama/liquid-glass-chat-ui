# Cookbook 2 (Astra): integration

```text
You are working inside my existing Expo React Native repository.

Use Appllama/liquid-glass-chat-ui as a read-only technical reference. Integrate only Cookbook 2 (Astra), preserving my app's current navigation and unrelated features.

Study:
- src/cookbooks/astra/screens/ and src/app/astra/ route adapters
- src/cookbooks/astra/CircleRail.tsx and circleMotion.ts
- src/cookbooks/astra/GlassPortrait.tsx, GlassFlight.tsx, and flight.ts
- src/cookbooks/astra/ui.tsx, data.ts, theme.ts, and insets.ts
- src/app/_layout.tsx for native providers and preloading
- src/cookbooks/NotFound.tsx for invalid conversation routes
- assets/cookbooks/astra/, docs/MOTION_SPEC.md, docs/ASSET_PROVENANCE.md

Before editing, inspect my Expo SDK, package manager, native build settings, router, state, and theme. Copy only Astra and its transitive helpers. Adapt the route URLs to my existing routes; do not copy the gallery or Fable. Preserve the same portrait nodes through compact/expanded states, the drop-before-fan path, touch-down spring catching, release velocity, lens response, measured portrait flight, native 220ms route fade, Apple photo zoom, and keyboard-following composer. Mount GlassFlight once above the Astra navigator. Preserve native form sheets for compose and preferences, and keep invalid deep links safe. Preserve contact-specific route identity when retaining conversation preloading. Keep gestureEnabled disabled on the photo route so native return gestures do not compete with image pinches; retain its Close control.

Use existing compatible packages. This cookbook uses Expo Router, expo-glass-effect, expo-image, expo-linear-gradient, expo-symbols, expo-haptics, Skia, Reanimated, Worklets, Gesture Handler, Keyboard Controller, safe-area context, FlashList, Zustand, MMKV, and Gluestack Button. Keep my existing styling setup. Rebuild native code after dependency changes.

Replace sample people, artwork, text, and storage namespaces with my product's identity. Verify search, filters, composing, sending, read state, mute, reactions, attachment sharing, photo open/close/pinch, portrait flight in both directions, rapid taps, light/dark appearance, and Reduce Motion on an iPhone simulator. Run TypeScript and lint. Report changed files and remaining platform limits.
```
