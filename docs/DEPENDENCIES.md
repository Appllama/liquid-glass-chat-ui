# Dependency compatibility

The lockfile targets Expo SDK 57, React Native 0.86.3, Skia 2.6.2, Reanimated 4.5.1, and React 19.2.3. React DOM is pinned to the same React version. Native peers for Expo Router and Expo Symbols are declared directly.

Two scoped fixes follow the Liquid Glass Screens reference repository:

- `xcode` uses UUID 11.1.1, retaining the CommonJS interface and safe output-buffer handling.
- Query String 7 expects a CommonJS decoder. `packages/decode-uri-component-compat` forwards that interface to the patched upstream decoder, avoiding the malformed-URI denial-of-service advisory without downgrading Expo Router.

`tests/dependency-compatibility.test.cjs` exercises actual router query parsing/serialization, bounded malformed-input processing, Xcode project identifier generation, and short-buffer rejection. These run with `npm run verify`.

A clean install uses `npm ci`. Do not run `npm audit fix --force`: its suggested Expo and Router downgrades would break this SDK.
