import { create } from "zustand";
import type { Person } from "./people";

type StoryState = { active: Person | null; seen: string[]; liked: string[] };
const useStories = create<StoryState>(() => ({
  active: null,
  seen: [],
  liked: [],
}));
export function markStorySeen(id: string) {
  useStories.setState((state) =>
    state.seen.includes(id) ? state : { seen: [...state.seen, id] },
  );
}
export function useStorySeen(id: string) {
  return useStories((state) => state.seen.includes(id));
}
export function openStory(person: Person) {
  useStories.setState({ active: person });
}
export function closeStory() {
  useStories.setState({ active: null });
}
export function useActiveStory() {
  return useStories((state) => state.active);
}
export function useStoryLiked(id: string) {
  return useStories((state) => state.liked.includes(id));
}
export function toggleStoryLike(id: string) {
  useStories.setState((state) => ({
    liked: state.liked.includes(id)
      ? state.liked.filter((key) => key !== id)
      : [...state.liked, id],
  }));
}
