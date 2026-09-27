# Motion specification

The two cookbooks preserve different interaction systems. They share native glass controls, Skia photo lenses, Reanimated, Gesture Handler, and a keyboard provider; they do not share one animation model.

## Cookbook 1 (Fable)

- The first 104 points of inbox scroll content hold the stories. The list starts at offset 104, with the rail folded into the title.
- Expanded avatars are 64 points, with a 12-point gap and a 16-point outer inset. The compact cluster has three 26-point portraits spaced 17 points apart.
- A drag ending inside the rail zone snaps at 80% when opening and 20% when closing. Below offset 144, a negative inset keeps a fling back to the top from inadvertently opening the rail.
- The story rail and title derive their positions from scroll progress on the UI thread. Horizontal scrolling resets only after collapse.
- Press feedback is 120ms; the shared settling spring uses duration 420ms and damping ratio 1. The soft arrival spring is 480ms with damping ratio 0.82.
- A story arrives over 280ms after a 50ms image-commit delay. It stays for six seconds. Tap, Close, or a drag exceeding 120 points / 900 points per second dismisses it. Reduced Motion keeps the six-second reading interval and removes the spatial card transform.
- The composer follows the system keyboard through `KeyboardStickyView`. The conversation's scroll padding follows the measured composer height; the keyboard height is never applied twice.
- Only newly appended messages animate. Outgoing text starts 22 points below its final position at scale 1.02, then settles into place.

## Cookbook 2 (Astra)

- One shared progress value drives all portraits and the conversation surface. The ribbon drops 56 points; content moves 110 points.
- Horizontal spread follows progress squared, and vertical drop follows `1 - (1 - progress)^2`, so portraits clear the heading before fanning out.
- Pan recognition starts after 7 points vertically and fails after 22 points horizontally. Touch-down catches a spring immediately; translation origin is captured at recognition to prevent a threshold jump.
- Release projects 120ms of velocity. Progress settles with damping 23, stiffness 230, mass 0.9; ordinary snaps use damping 26, stiffness 270, mass 0.9.
- Layout tracks the finger directly. A separate trailing spring changes lens reflection, tilt, and deformation. Offscreen lenses do not receive continuous light updates.
- Conversation routes use the contact ID as their navigation identity, so preloading one contact cannot redirect a different selection.
- A selected portrait travels between measured inbox and conversation slots. The native route fades over 220ms. The portrait spring uses stiffness 245, damping 27, mass 0.85 and a 12-point arc. A 1.4-second recovery timer clears interrupted flights.
- Photo expansion uses Expo Router `Link.AppleZoom` / `Link.AppleZoomTarget`. Pinch is bounded between 1x and 3x. The photo route disables interactive native dismissal so image pinches cannot start a competing return transition; the Close control retains the native zoom-out animation.
- Reduced Motion bypasses portrait flight and uses a simpler rail transition. Reanimated honors the system preference for ordinary springs and timings.

## Glass

Controls use `expo-glass-effect` and Apple's native iOS 26 material. Portraits use custom Skia shaders to refract their local photographs. Keep native glass ancestors visible: zero opacity can disable Apple's effect. The source includes fallbacks, but this gallery targets iOS.

Motion validation is documented in `VERIFICATION.md`. Simulator captures demonstrate behavior and visual continuity; they are not a physical-device frame-rate benchmark.
