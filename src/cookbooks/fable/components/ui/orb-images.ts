import { Skia, type SkImage } from "@shopify/react-native-skia";
import { useEffect, useSyncExternalStore } from "react";
import { Image } from "react-native";

/**
 * Skia images for the orbs, decoded once per asset and shared by every orb
 * that shows the same person. Each orb subscribes only to its own image, so
 * a decode never re-renders orbs that were not waiting for it.
 */
const cache = new Map<number, SkImage>();
const pending = new Map<number, Promise<SkImage | null>>();
const listeners = new Map<number, Set<() => void>>();

function notify(source: number) {
  listeners.get(source)?.forEach((l) => l());
}

export function loadOrbImage(source: number): Promise<SkImage | null> {
  const hit = cache.get(source);
  if (hit) return Promise.resolve(hit);
  const inflight = pending.get(source);
  if (inflight) return inflight;
  const resolved = Image.resolveAssetSource(source);
  const task = Skia.Data.fromURI(resolved.uri)
    .then((data) => {
      const img = Skia.Image.MakeImageFromEncoded(data);
      if (img) {
        cache.set(source, img);
        notify(source);
      }
      return img;
    })
    .catch(() => null)
    .finally(() => pending.delete(source));
  pending.set(source, task);
  return task;
}

export function preloadOrbImages(sources: number[]) {
  return Promise.all(sources.map(loadOrbImage));
}

export function useOrbImage(source: number): SkImage | null {
  useEffect(() => {
    loadOrbImage(source);
  }, [source]);
  return useSyncExternalStore(
    (listener) => {
      let set = listeners.get(source);
      if (!set) {
        set = new Set();
        listeners.set(source, set);
      }
      set.add(listener);
      return () => {
        set.delete(listener);
      };
    },
    () => cache.get(source) ?? null,
  );
}
