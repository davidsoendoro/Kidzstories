import type { StoryTemplate } from "./types";

export const oceanTemplate: StoryTemplate = {
  id: "ocean-birthday",
  title: "{{name}}'s Under-the-Sea Birthday",
  summary: "A birthday treasure hunt under the waves, ending with the biggest party the ocean has ever seen.",
  ageRange: "2-6",
  palette: { bg: "#1b6f9e", accent: "#ff8fab" },
  slots: [
    { key: "seaFriend", label: "Sea friend", options: ["a playful dolphin", "a smiley sea turtle", "a tiny seahorse", "a friendly octopus"], allowCustom: true, default: "a playful dolphin" },
    { key: "age", label: "Birthday age", options: ["2", "3", "4", "5", "6", "7"], allowCustom: false, default: "5" },
    { key: "cake", label: "Birthday cake", options: ["chocolate cake", "strawberry cake", "vanilla cake with sprinkles", "rainbow cake"], allowCustom: true, default: "rainbow cake" },
  ],
  pages: [
    {
      beat: "It's the hero's birthday morning at the beach.",
      text: "It was {{name}}'s birthday! {{They}} ran down to the beach, wiggled {{their}} toes in the sand, and waved at the sparkly sea.",
      anchors: ["birthday", "beach"],
      scene: { kind: "sky", prompt: "A child running joyfully on a sunny beach toward the sea", motifs: ["sun"] },
    },
    {
      beat: "A message in a bottle invites the hero below.",
      text: "A bottle bobbed onto the shore. Inside was a note: \"Happy birthday! Come and find your surprise under the sea.\"",
      anchors: ["bottle", "surprise"],
      scene: { kind: "sky", prompt: "A glass bottle with a rolled note on wet sand", motifs: ["sun"] },
    },
    {
      beat: "The sea friend appears and takes the hero underwater.",
      text: "Out popped {{seaFriend}}! \"Hold on tight,\" it said, and down they swam into the bright blue water.",
      anchors: ["swam", "water"],
      scene: { kind: "sea", prompt: "The child swimming down with a sea creature through sunbeams", motifs: ["fish", "bubbles"] },
    },
    {
      beat: "First clue at the coral reef.",
      text: "At the coral reef, a clownfish giggled and handed {{name}} a shell with a clue: \"Follow the bubbles!\"",
      anchors: ["coral", "bubbles"],
      scene: { kind: "sea", prompt: "A colourful coral reef with a clownfish holding a shell", motifs: ["fish", "bubbles"] },
    },
    {
      beat: "Follow the bubbles past a sleepy whale.",
      text: "The bubbles floated past a giant sleepy whale. \"Shhh,\" whispered {{name}}, tiptoe-swimming very, very quietly.",
      anchors: ["whale", "quietly"],
      scene: { kind: "sea", prompt: "A huge gentle whale sleeping in deep blue water", motifs: ["bubbles", "fish"] },
    },
    {
      beat: "Discover the surprise: a party in a sunken ship.",
      text: "The bubbles led to an old sunken ship. {{name}} opened the door and... \"SURPRISE!\" shouted all the sea creatures.",
      anchors: ["ship", "surprise"],
      scene: { kind: "sea", prompt: "A sunken ship decorated with seaweed streamers and sea creatures", motifs: ["fish", "bubbles"] },
    },
    {
      beat: "Cake and candles for the hero's age.",
      text: "There was a {{cake}} with {{age}} glowing candles. {{name}} made a wish and blew them out with one big puff.",
      anchors: ["candles", "wish"],
      scene: { kind: "sea", prompt: "A birthday cake with glowing candles underwater", motifs: ["cake", "bubbles"] },
    },
    {
      beat: "Return to the beach; happy ending.",
      text: "As the sun set, {{seaFriend}} carried {{name}} back to the beach. It was the best birthday under the sea, ever!",
      anchors: ["birthday", "beach"],
      scene: { kind: "sky", prompt: "Sunset over the beach with the sea friend waving goodbye", motifs: ["sun"] },
    },
  ],
};
