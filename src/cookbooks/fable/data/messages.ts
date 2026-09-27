export type Message = {
  id: string;
  from: "me" | "them";
  text: string;
  at: string;
  photo?: boolean;
};

const mara: Message[] = [
  {
    id: "m1",
    from: "them",
    text: "Are you still up for the cabin thing this month?",
    at: "Yesterday 21:05",
  },
  {
    id: "m2",
    from: "me",
    text: "Very. I have been staring at a spreadsheet for nine hours, I need a tree.",
    at: "Yesterday 21:08",
  },
  {
    id: "m3",
    from: "them",
    text: "Good. Because I found a place.",
    at: "Yesterday 21:09",
  },
  {
    id: "m4",
    from: "them",
    text: "Wood sauna. Lake you can jump into after. Two hours north, no signal past the last gas station.",
    at: "Yesterday 21:09",
  },
  {
    id: "m5",
    from: "me",
    text: "No signal is a feature.",
    at: "Yesterday 21:14",
  },
  { id: "m6", from: "me", text: "Who else is coming?", at: "Yesterday 21:14" },
  {
    id: "m7",
    from: "them",
    text: "Theo, Elena, maybe Lucas if his knee behaves.",
    at: "Yesterday 21:20",
  },
  {
    id: "m8",
    from: "them",
    text: "Sunday still works for the cabin? I found a place with a wood sauna and a lake you can jump into.",
    at: "9:41",
  },
];

const theo: Message[] = [
  {
    id: "t1",
    from: "me",
    text: "How is the mix coming?",
    at: "Yesterday 18:02",
  },
  {
    id: "t2",
    from: "them",
    text: "Close. Rebuilt the drums on track 4 from scratch.",
    at: "Yesterday 18:40",
  },
  {
    id: "t3",
    from: "them",
    text: "Sent you the mix. Track 4 is the one — tell me if the bass is too much.",
    at: "9:12",
  },
];

const fable: Message[] = [
  { id: "o1", from: "them", text: "Welcome to Fable.", at: "8:30" },
  {
    id: "o2",
    from: "them",
    text: "Pull down on your chats to see who posted a story today. Scroll back up and they tuck into the title.",
    at: "8:30",
  },
  {
    id: "o3",
    from: "them",
    text: "Everything here is glass. Try dragging the keyboard.",
    at: "8:30",
  },
];

const generic = (name: string): Message[] => [
  {
    id: "g1",
    from: "them",
    text: `Hey, it's ${name}. Are you around later?`,
    at: "Yesterday 17:12",
  },
  {
    id: "g2",
    from: "me",
    text: "Around after six. What is up?",
    at: "Yesterday 17:30",
  },
  {
    id: "g3",
    from: "them",
    text: "Nothing urgent. Just wanted to catch up properly, it has been a while.",
    at: "Yesterday 17:31",
  },
  {
    id: "g4",
    from: "me",
    text: "It really has. Call at seven?",
    at: "Yesterday 17:33",
  },
  { id: "g5", from: "them", text: "Seven is perfect.", at: "Yesterday 17:33" },
];

export function messagesFor(personId: string, first: string): Message[] {
  switch (personId) {
    case "mara":
      return mara;
    case "theo":
      return theo;
    case "fable":
      return fable;
    default:
      return generic(first);
  }
}

export const REPLIES = [
  "Ha, okay. Give me a minute.",
  "Say more.",
  "That is exactly what I was thinking.",
  "Deal. I will sort the rest.",
  "Send me the details and I am in.",
];
