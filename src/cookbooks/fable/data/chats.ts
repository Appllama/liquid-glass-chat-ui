export type Chat = {
  id: string;
  personId: string;
  preview: string;
  time: string;
  unread: number;
  fromMe?: boolean;
};

export const CHATS: Chat[] = [
  {
    id: "mara",
    personId: "mara",
    preview:
      "Sunday still works for the cabin? I found a place with a wood sauna and a lake you can jump into.",
    time: "9:41",
    unread: 2,
  },
  {
    id: "theo",
    personId: "theo",
    preview:
      "Sent you the mix. Track 4 is the one — tell me if the bass is too much.",
    time: "9:12",
    unread: 1,
  },
  {
    id: "fable",
    personId: "fable",
    preview:
      "Welcome to Fable. Pull down on your chats to see who posted a story today.",
    time: "8:30",
    unread: 0,
  },
  {
    id: "elena",
    personId: "elena",
    preview:
      "okay the pasta place near Bleecker is actually good, not just good-for-here good",
    time: "Yesterday",
    unread: 0,
    fromMe: true,
  },
  {
    id: "jonas",
    personId: "jonas",
    preview:
      "Reviewed the deck. Slide 7 needs a number, not an adjective. Otherwise ship it.",
    time: "Yesterday",
    unread: 0,
  },
  {
    id: "sofia",
    personId: "sofia",
    preview: "Mom says hi and also asks when you are coming for tamales",
    time: "Yesterday",
    unread: 3,
  },
  {
    id: "kenji",
    personId: "kenji",
    preview: "The print shop can do 300gsm. Matte or soft-touch?",
    time: "Mon",
    unread: 0,
    fromMe: true,
  },
  {
    id: "amara",
    personId: "amara",
    preview: "Landed. Lagos is 34° and my phone is already at 40%",
    time: "Mon",
    unread: 0,
  },
  {
    id: "lucas",
    personId: "lucas",
    preview: "Court is booked for 7. Bring the good balls this time.",
    time: "Sun",
    unread: 0,
  },
  {
    id: "zara",
    personId: "zara",
    preview: "That article you sent rearranged my whole afternoon, thank you",
    time: "Sun",
    unread: 0,
  },
  {
    id: "elias",
    personId: "elias",
    preview:
      "Photos from the lake are on the drive. The one of the heron is yours to keep.",
    time: "Sat",
    unread: 0,
  },
  {
    id: "nia",
    personId: "nia",
    preview: "We should pitch it as a series, not a one-off. Call Thursday?",
    time: "Fri",
    unread: 0,
  },
  {
    id: "rafael",
    personId: "rafael",
    preview: "Boa noite! Recipe is in the thread. Do not skip the lime.",
    time: "Thu",
    unread: 0,
  },
];
