# Verification

Validated on September 27, 2026 with the bundled Release app. The app runs without Metro or a network service.

## Automated checks

| Check | Result |
| --- | --- |
| Clean `npm ci` | Passed; lockfile installs successfully. |
| Strict TypeScript and Expo ESLint | Passed. |
| Node regression suite | 18 tests covering message IDs, blank/invalid submissions, read/reset state, reactions, persistence isolation, actual router query parsing, asset integrity, route adapters, and documentation links. |
| `npx expo-doctor` | 21/21 checks passed. |
| `npm audit` | Zero reported vulnerabilities. |
| iOS JavaScript export | Passed. |
| Native iOS Release build | Passed; zero errors. Generated native dependencies emit Xcode deprecation warnings; TypeScript and lint are clean. |

## Simulator checks

The primary device is an isolated iPhone 17 Pro running iOS 26.5 (402 × 874 points). A separate iPhone 17e checks the narrower 390 × 844-point layout. Both cookbooks passed there at `extra-extra-extra-large` text size. Reduce Motion was then enabled in Settings, visually confirmed, and checked with timed stories, portrait expansion, and conversation navigation.

Run the native regression suite with a Release build installed and Maestro available:

```bash
SIMULATOR_UDID=<your-booted-device> npm run test:ios
```

- Fable: fold/unfold stories, horizontal portrait browsing, timed dismissal, manual close, like/reply, drag dismissal, conversation entry/back, sending and simulated replies, keyboard movement, shared-photo open/close, empty contact search, contact selection, light/dark appearance, and gallery return.
- Astra: correct contact selection after preloading, expand/collapse the ribbon, horizontal browsing, portrait navigation, native photo open/close, reactions, sending, attachment sharing, mute state, filters, empty search, composing, light/dark appearance, and gallery return.
- Navigation: cold conversation links, persisted messages after app termination, invalid contact IDs (including `constructor`), and safe return routes.

Six-second story controls also pass direct IDB checks: manual Close, like state, reply navigation, and drag dismissal. The reproducible helper is `scripts/verify-stories.py`; it requires the IDB accessibility client (validated with 1.6.1) and a companion on the same device.

```bash
idb_companion --udid <device-id> --grpc-port 10981
# In a second terminal, with the IDB Python client installed:
SIMULATOR_UDID=<device-id> python3 scripts/verify-stories.py
```

All three Maestro flows passed (3/3, 3m 23s), covering both cookbooks and cold navigation. The final photo-gesture change was then rebuilt and rechecked with native pinch and Close input. Fast story gestures and photo pinches are additionally checked with direct HID input.

The scripts handle the simulator's [first-use deep-link confirmation](https://docs.maestro.dev/reference/commands-available/openlink#ios-security-confirmation). System alerts are outside the app's view hierarchy.

## Visual and motion review

The README previews are direct captures from this build. Separate native recordings cover the Fable story controls and Astra ribbon, forward/return portrait travel, photo expansion, and 1×–2×–1× pinch. The photo viewer uses Close for native return; interactive dismissal is disabled to keep the image pinch independent. Consecutive decoded frames were inspected through those transitions. Visual inspection checks portrait alignment, copy hierarchy, message clearance above the floating composer, keyboard-open layouts, native photo transitions, and light/dark contrast. Native recordings and decoded frames are retained locally under ignored `.qa/`.

The record helper is reusable:

```bash
SIMULATOR_UDID=<your-booted-device> scripts/record-ios.sh walkthrough
```

Stop recording with Control-C. The result is written to `.qa/recordings/walkthrough.mp4`.

## Limits

This is an iOS UI cookbook with local sample data. No messaging backend, authentication, calling, or voice-recording service is included. Android, web, physical-device frame-rate measurements, and network integrations are not verified targets. Simulator recordings demonstrate interaction and visual continuity; their frame rate is not a claim about hardware performance.
