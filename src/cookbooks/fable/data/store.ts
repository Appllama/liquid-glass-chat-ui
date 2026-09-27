import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createMMKV } from "react-native-mmkv";
import { messagesFor, type Message } from "./messages";
import { PEOPLE_BY_ID } from "./people";

const storage = createMMKV({ id: "fable-local-v1" });
let sequence = 0;
type State = {
  threads: Record<string, Message[]>;
  read: string[];
  theme: "system" | "light" | "dark";
  append: (
    id: string,
    text: string,
    from?: Message["from"],
    photo?: boolean,
  ) => void;
  markRead: (id: string) => void;
  setTheme: (theme: State["theme"]) => void;
  reset: () => void;
};
export const useFable = create<State>()(
  persist(
    (set, get) => ({
      threads: {},
      read: [],
      theme: "system",
      append: (id, text, from = "me", photo = false) => {
        const person = PEOPLE_BY_ID[id];
        if (!person || (!photo && !text.trim())) return;
        set((state) => ({
          threads: {
            ...state.threads,
            [id]: [
              ...(state.threads[id] ?? messagesFor(id, person.first)),
              {
                id: `local-${Date.now()}-${++sequence}`,
                from,
                text: text.trim(),
                at: "now",
                photo,
              },
            ],
          },
        }));
      },
      markRead: (id) => {
        if (!get().read.includes(id))
          set((state) => ({ read: [...state.read, id] }));
      },
      setTheme: (theme) => set({ theme }),
      reset: () => set({ threads: {}, read: [] }),
    }),
    {
      name: "fable-state",
      storage: createJSONStorage(() => ({
        getItem: (key) => storage.getString(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.remove(key),
      })),
    },
  ),
);
