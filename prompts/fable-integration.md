# Cookbook 1 (Fable): integration

```text
You are working inside my existing Expo React Native repository.

Use Appllama/liquid-glass-chat-ui as a read-only technical reference. Integrate only Cookbook 1 (Fable), preserving my app's current navigation and unrelated features.

Study:
- src/cookbooks/fable/screens/Inbox.tsx and Conversation.tsx
- src/cookbooks/fable/components/chats/, thread/, stories/, and ui/
- src/cookbooks/fable/data/, constants/, and hooks/
- src/app/fable/ for the required Expo Router adapters and native sheets
- src/app/_layout.tsx for asset preloading and native providers
- src/cookbooks/NotFound.tsx for invalid conversation routes
- assets/cookbooks/fable/, docs/MOTION_SPEC.md, docs/ASSET_PROVENANCE.md

Before editing, inspect my Expo SDK, package manager, native build settings, router, state, and theme. Copy only Fable and its transitive helpers. Adapt the route URLs to my existing routes; do not copy the gallery or Astra. Preserve the 104pt folding story rail, three-portrait cluster, horizontal story browsing, glass lens shaders, story dismissal gestures, grouped bubbles, and keyboard-following composer. Keep native sheets for compose and preferences. Mount StoryHost once above the Fable navigator, inside safe-area, Gesture Handler, and Keyboard Controller providers. Preload portraits before showing the inbox.

Use the existing packages in my app when compatible. This cookbook uses Expo Router, expo-glass-effect, expo-blur, expo-image, expo-linear-gradient, expo-symbols, expo-haptics, Skia, Reanimated, Worklets, Gesture Handler, Keyboard Controller, safe-area context, FlashList, Zustand, and MMKV. Rebuild native code after dependency changes.

Replace sample people, artwork, text, and storage namespaces with my product's identity. Keep simulated replies visibly local until connected to my backend. Verify folding/unfolding, interrupted drags, stories, back navigation, keyboard appearance/dismissal, message persistence, photo sharing, invalid deep links, light/dark appearance, and Reduce Motion on an iPhone simulator. Run TypeScript and lint. Report changed files and remaining platform limits.
```
