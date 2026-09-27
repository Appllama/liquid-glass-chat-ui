import { Easing } from "react-native-reanimated";

/** One spring vocabulary for the whole app. */
export const SNAP = { duration: 420, dampingRatio: 1 } as const; // settle, no bounce
export const SOFT = { duration: 480, dampingRatio: 0.82 } as const; // one gentle overshoot
export const POP = { duration: 380, dampingRatio: 0.7 } as const; // celebratory

/** Timing for anything the finger did not touch. */
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
export const ENTER_MS = 260;
export const EXIT_MS = 170;
export const PRESS_MS = 120;
