import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createMMKV } from "react-native-mmkv";

export const portraits = [
  require("../../../assets/cookbooks/astra/portraits/0.png"),
  require("../../../assets/cookbooks/astra/portraits/1.png"),
  require("../../../assets/cookbooks/astra/portraits/2.png"),
  require("../../../assets/cookbooks/astra/portraits/3.png"),
  require("../../../assets/cookbooks/astra/portraits/4.png"),
  require("../../../assets/cookbooks/astra/portraits/5.png"),
  require("../../../assets/cookbooks/astra/portraits/6.png"),
  require("../../../assets/cookbooks/astra/portraits/7.png"),
  require("../../../assets/cookbooks/astra/portraits/8.png"),
];
export const coast = require("../../../assets/cookbooks/astra/photos/coast.png");
export type Person = {
  id: string;
  name: string;
  short: string;
  avatar: number;
  preview: string;
  time: string;
  unread?: number;
  online?: boolean;
  group?: boolean;
};
export const people: Person[] = [
  {
    id: "mira",
    name: "Mira Ellis",
    short: "Mira",
    avatar: 0,
    preview: "Found our kind of nowhere.",
    time: "now",
    unread: 2,
    online: true,
  },
  {
    id: "weekend",
    name: "The Sunday Club",
    short: "Sunday",
    avatar: 4,
    preview: "Theo: Same table, same chaos?",
    time: "4m",
    unread: 3,
    group: true,
  },
  {
    id: "zora",
    name: "Zora Bennett",
    short: "Zora",
    avatar: 1,
    preview: "This has your name all over it",
    time: "12m",
    unread: 1,
    online: true,
  },
  {
    id: "kenji",
    name: "Kenji Park",
    short: "Kenji",
    avatar: 2,
    preview: "You: Saving you the window seat.",
    time: "28m",
    online: true,
  },
  {
    id: "asha",
    name: "Asha Rao",
    short: "Asha",
    avatar: 3,
    preview: "One coffee turned into four hours.",
    time: "1h",
  },
  {
    id: "cleo",
    name: "Cleo Martin",
    short: "Cleo",
    avatar: 5,
    preview: "Sent you a little piece of today",
    time: "2h",
  },
  {
    id: "miles",
    name: "Miles Davis",
    short: "Miles",
    avatar: 6,
    preview: "You: That’s the one. Press play.",
    time: "3h",
  },
  {
    id: "june",
    name: "June Kim",
    short: "June",
    avatar: 7,
    preview: "Let’s take the long way home.",
    time: "5h",
  },
  {
    id: "eli",
    name: "Eli Brooks",
    short: "Eli",
    avatar: 8,
    preview: "A very good day for doing nothing.",
    time: "Yesterday",
  },
];
export type Message = {
  id: string;
  kind: "text" | "photo";
  text?: string;
  mine: boolean;
  heart?: boolean;
  stamp?: string;
};
const mira: Message[] = [
  {
    id: "m1",
    kind: "text",
    text: "Saturday, somewhere like this?",
    mine: false,
  },
  { id: "m2", kind: "text", text: "No plans. Just us.", mine: true },
  { id: "m3", kind: "photo", text: "Somewhere with no plans.", mine: false },
  {
    id: "m5",
    kind: "text",
    text: "A little farther from everything.",
    mine: false,
  },
];
export function initialMessages(id: string): Message[] {
  if (id === "mira") return mira;
  const person = people.find((p) => p.id === id);
  if (!person) return [];
  return [
    {
      id: `${id}-1`,
      kind: "text",
      mine: false,
      text: person.preview.replace("You: ", "").replace("Theo: ", ""),
    },
  ];
}
let sequence = 0;
const storage = createMMKV({ id: "astra-local-v1" });
type ChatState = {
  threads: Record<string, Message[]>;
  read: string[];
  muted: string[];
  theme: "system" | "light" | "dark";
  haptics: boolean;
  send: (id: string, text: string, kind?: Message["kind"]) => void;
  heart: (id: string, message: string) => void;
  markRead: (id: string) => void;
  setTheme: (theme: ChatState["theme"]) => void;
  toggleMute: (id: string) => void;
  toggleHaptics: () => void;
  reset: () => void;
};
export const useChat = create<ChatState>()(
  persist(
    (set, get) => ({
      threads: {},
      read: [],
      muted: [],
      theme: "system",
      haptics: true,
      send: (id, text, kind = "text") => {
        if (
          !people.some((person) => person.id === id) ||
          (kind === "text" && !text.trim())
        )
          return;
        set((state) => ({
          threads: {
            ...state.threads,
            [id]: [
              ...(state.threads[id] ?? initialMessages(id)),
              {
                id: `local-${Date.now()}-${++sequence}`,
                kind,
                text,
                mine: true,
              },
            ],
          },
        }));
      },
      heart: (id, message) =>
        set((state) => ({
          threads: {
            ...state.threads,
            [id]: (state.threads[id] ?? initialMessages(id)).map((m) =>
              m.id === message ? { ...m, heart: !m.heart } : m,
            ),
          },
        })),
      markRead: (id) => {
        if (get().read.includes(id)) return;
        set((state) => ({ read: [...state.read, id] }));
      },
      setTheme: (theme) => set({ theme }),
      toggleMute: (id) =>
        set((state) => ({
          muted: state.muted.includes(id)
            ? state.muted.filter((x) => x !== id)
            : [...state.muted, id],
        })),
      toggleHaptics: () => set((state) => ({ haptics: !state.haptics })),
      reset: () => set({ threads: {}, read: [], muted: [] }),
    }),
    {
      name: "astra-state",
      storage: createJSONStorage(() => ({
        getItem: (k) => storage.getString(k) ?? null,
        setItem: (k, v) => storage.set(k, v),
        removeItem: (k) => storage.remove(k),
      })),
    },
  ),
);
