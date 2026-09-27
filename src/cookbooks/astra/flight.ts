import { create } from "zustand";
import { useCallback, useRef } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useReducedMotion } from "react-native-reanimated";
import { type Person } from "./data";

type Rect = { x: number; y: number; size: number; slot: string };
export type Flight = {
  key: number;
  person: string;
  avatar: number;
  from: Rect;
  to?: Rect;
};
let sequence = 0;
export const useFlight = create<{
  active: Flight | null;
  origins: Record<string, Rect>;
  begin: (person: Person, from: Rect, returning?: boolean) => void;
  land: (person: string, to: Rect) => void;
  finish: (key: number) => void;
}>((set) => ({
  active: null,
  origins: {},
  begin: (person, from, returning = false) =>
    set((state) => ({
      active: {
        key: ++sequence,
        person: person.id,
        avatar: person.avatar,
        from,
        to: returning ? state.origins[person.id] : undefined,
      },
      origins: returning
        ? state.origins
        : { ...state.origins, [person.id]: from },
    })),
  land: (person, to) =>
    set((state) =>
      state.active?.person === person && !state.active.to
        ? { active: { ...state.active, to } }
        : state,
    ),
  finish: (key) =>
    set((state) => (state.active?.key === key ? { active: null } : state)),
}));

// Router owns navigation. This carries only the portrait between measured slots.
export function usePortraitNavigation(person: Person, location = "header") {
  const slot = `${location}-${person.id}`;
  const ref = useRef<View>(null);
  const reduced = useReducedMotion();
  const open = () => {
    if (useFlight.getState().active) return;
    const navigate = () => {
      router.push({ pathname: "/astra/chat/[id]", params: { id: person.id } });
    };
    if (reduced || !ref.current) return navigate();
    ref.current.measureInWindow((x, y, width) => {
      if (width > 0)
        useFlight.getState().begin(person, { x, y, size: width, slot });
      navigate();
    });
  };
  const back = () => {
    if (useFlight.getState().active) return;
    if (reduced || !ref.current || !useFlight.getState().origins[person.id])
      return router.back();
    ref.current.measureInWindow((x, y, width) => {
      if (width <= 0) return router.back();
      useFlight.getState().begin(person, { x, y, size: width, slot }, true);
      // Paint the hidden header slot before native-stack snapshots the route.
      // Otherwise its outgoing snapshot retains a second stationary portrait.
      requestAnimationFrame(() => requestAnimationFrame(() => router.back()));
    });
  };
  const land = useCallback(
    () =>
      requestAnimationFrame(() => {
        ref.current?.measureInWindow((x, y, width) => {
          if (width > 0)
            useFlight.getState().land(person.id, { x, y, size: width, slot });
        });
      }),
    [person.id, slot],
  );
  return { ref, open, back, land };
}
