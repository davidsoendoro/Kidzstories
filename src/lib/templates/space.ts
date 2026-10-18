import type { StoryTemplate } from "./types";

export const spaceTemplate: StoryTemplate = {
  id: "moon-mission",
  title: "{{name}} and the Moon Mission",
  summary: "A brave little astronaut rockets to the Moon to return a lost star to the night sky.",
  ageRange: "3-7",
  palette: { bg: "#1d2353", accent: "#ffb84d" },
  slots: [
    { key: "companion", label: "Space buddy", options: ["a friendly robot named Bolt", "a curious cat named Comet", "a tiny dragon named Ember"], allowCustom: true, default: "a friendly robot named Bolt" },
    { key: "rocketColor", label: "Rocket colour", options: ["red", "blue", "purple", "golden", "green"], allowCustom: false, default: "red" },
    { key: "snack", label: "Favourite space snack", options: ["strawberry pancakes", "apple slices", "cheese crackers", "banana muffins"], allowCustom: true, default: "strawberry pancakes" },
  ],
  pages: [
    {
      beat: "Introduce the hero at bedtime, dreaming of space.",
      text: "Every night, {{name}} looked out of the window at the twinkling stars and whispered, \"One day, I will fly up there.\"",
      anchors: ["stars"],
      scene: { kind: "night", prompt: "A child at a bedroom window gazing at a starry sky", motifs: ["stars", "moon", "house"] },
    },
    {
      beat: "Notice a problem: one star has fallen.",
      text: "One evening, a little star tumbled out of the sky and landed softly in the garden. It was blinking, and it looked very lonely.",
      anchors: ["star", "garden"],
      scene: { kind: "night", prompt: "A small glowing star resting in a moonlit garden", motifs: ["stars", "flowers"] },
    },
    {
      beat: "Meet the companion who offers help.",
      text: "\"We have to take it home!\" said {{companion}}. {{name}} nodded bravely. \"Let's build a rocket.\"",
      anchors: ["rocket"],
      scene: { kind: "home", prompt: "The child and their companion planning with cardboard and tools", motifs: ["house", "rocket"] },
    },
    {
      beat: "Build and launch the rocket.",
      text: "They built a shiny {{rocketColor}} rocket. 3... 2... 1... WHOOSH! Up, up, up they flew, past the clouds and into space.",
      anchors: ["rocket", "space"],
      scene: { kind: "space", prompt: "A colourful rocket blasting off through the clouds into space", motifs: ["rocket", "stars"] },
    },
    {
      beat: "A challenge on the journey that the hero solves.",
      text: "A field of bumpy space rocks blocked the way! {{name}} held the controls steady and steered the rocket safely through.",
      anchors: ["rocks"],
      scene: { kind: "space", prompt: "A rocket weaving between colourful asteroids", motifs: ["rocket", "stars", "mountain"] },
    },
    {
      beat: "Arrive on the Moon and share a snack.",
      text: "At last they landed on the Moon. {{name}} and {{companion}} shared {{snack}} and bounced in the low gravity.",
      anchors: ["moon"],
      scene: { kind: "space", prompt: "The child bouncing on the moon's surface with a picnic", motifs: ["moon", "stars"] },
    },
    {
      beat: "Return the star to the sky.",
      text: "{{name}} lifted the little star high. It floated up and up, back to its family, and began to shine brighter than ever.",
      anchors: ["star", "shine"],
      scene: { kind: "space", prompt: "A star rising from the child's hands into a constellation", motifs: ["stars", "moon"] },
    },
    {
      beat: "Return home; the star says thank you. Cosy ending.",
      text: "Back home in bed, {{name}} saw one star twinkle extra bright, just for {{them}}. \"Goodnight, little star,\" {{they}} whispered, and fell fast asleep.",
      anchors: ["star", "goodnight"],
      scene: { kind: "night", prompt: "The child asleep in bed while one star shines brightly outside", motifs: ["stars", "moon", "house"] },
    },
  ],
};
