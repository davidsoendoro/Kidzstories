import type { StoryTemplate } from "./types";

export const forestTemplate: StoryTemplate = {
  id: "whispering-forest",
  title: "{{name}} and the Whispering Forest",
  summary: "A kind-hearted explorer helps the forest animals find the missing key to the Spring Festival.",
  ageRange: "3-8",
  palette: { bg: "#2f6b4f", accent: "#ffd166" },
  slots: [
    { key: "animal", label: "Forest friend", options: ["a shy fox", "a wise old owl", "a giggling squirrel", "a gentle deer"], allowCustom: true, default: "a wise old owl" },
    { key: "item", label: "Special item to carry", options: ["a magic lantern", "a trusty compass", "a red backpack", "a golden whistle"], allowCustom: false, default: "a magic lantern" },
    { key: "song", label: "Song the animals sing", options: ["a happy humming song", "a bouncy clapping song", "a sleepy lullaby"], allowCustom: false, default: "a happy humming song" },
  ],
  pages: [
    {
      beat: "The hero sets off into the forest with their special item.",
      text: "One sunny morning, {{name}} packed {{item}} and walked down the winding path into the Whispering Forest.",
      anchors: ["forest"],
      scene: { kind: "forest", prompt: "A child entering a sunlit storybook forest along a winding path", motifs: ["trees", "sun"] },
    },
    {
      beat: "Meet the forest friend, who is worried.",
      text: "Under a tall oak tree sat {{animal}}, looking very worried. \"The key to the Spring Festival is lost,\" it sighed.",
      anchors: ["key", "festival"],
      scene: { kind: "forest", prompt: "A worried woodland animal beneath a huge oak tree", motifs: ["trees"] },
    },
    {
      beat: "The hero promises to help.",
      text: "\"Don't worry,\" said {{name}} with a smile. \"I'm a very good finder. We'll look together!\"",
      anchors: ["together"],
      scene: { kind: "forest", prompt: "The child kneeling to comfort the animal friend", motifs: ["trees", "flowers"] },
    },
    {
      beat: "Search the river - first clue.",
      text: "They searched by the bubbling river. A frog pointed a long green finger towards the hills. \"I saw something shiny up there!\"",
      anchors: ["river", "shiny"],
      scene: { kind: "meadow", prompt: "A frog on a lily pad by a sparkling river pointing to distant hills", motifs: ["trees", "sun"] },
    },
    {
      beat: "A dark cave - the hero is brave using the item.",
      text: "The path led to a dark cave. {{name}} took a deep breath, held up {{item}}, and stepped inside.",
      anchors: ["cave", "breath"],
      scene: { kind: "night", prompt: "The child at the mouth of a cave, bravely lighting the way", motifs: ["mountain", "stars"] },
    },
    {
      beat: "Find the key with a sleeping bear, and share kindly.",
      text: "Inside, a sleepy bear cub was using the golden key as a teething toy! {{name}} gently swapped it for a honey biscuit.",
      anchors: ["key", "bear"],
      scene: { kind: "night", prompt: "A sleepy bear cub in a cosy cave holding a golden key", motifs: ["mountain"] },
    },
    {
      beat: "Return the key and open the festival.",
      text: "Back in the forest, {{name}} turned the key in the old wooden gate. Flowers burst open and the Spring Festival began!",
      anchors: ["key", "festival"],
      scene: { kind: "meadow", prompt: "A gate swinging open onto a meadow bursting with flowers", motifs: ["flowers", "sun", "trees"] },
    },
    {
      beat: "Celebration and warm ending.",
      text: "All the animals sang {{song}} for {{name}}, the bravest, kindest finder in the whole Whispering Forest.",
      anchors: ["forest"],
      scene: { kind: "forest", prompt: "Woodland animals celebrating around the child with lanterns", motifs: ["trees", "flowers", "stars"] },
    },
  ],
};
