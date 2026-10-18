import type { StoryTemplate } from "./types";

export const dinoTemplate: StoryTemplate = {
  id: "dino-egg",
  title: "{{name}} and the Runaway Dino Egg",
  summary: "A rolling dinosaur egg leads to a gentle adventure in Dino Valley and a brand new friend.",
  ageRange: "3-7",
  palette: { bg: "#7a4b2a", accent: "#9be564" },
  slots: [
    { key: "dino", label: "Baby dinosaur", options: ["triceratops", "stegosaurus", "brachiosaurus", "little T-rex"], allowCustom: false, default: "triceratops" },
    { key: "dinoName", label: "Baby dino's name", options: ["Pip", "Rocky", "Bubbles", "Sunny"], allowCustom: true, default: "Pip" },
    { key: "game", label: "Game they play", options: ["hide and seek", "tag", "puddle jumping", "a dancing game"], allowCustom: false, default: "puddle jumping" },
  ],
  pages: [
    {
      beat: "The hero finds a strange egg on a walk.",
      text: "On a walk in the park, {{name}} found an enormous speckled egg sitting in the grass. It was rocking all by itself!",
      anchors: ["egg"],
      scene: { kind: "meadow", prompt: "A child discovering a giant speckled egg in the grass", motifs: ["egg", "trees", "sun"] },
    },
    {
      beat: "The egg rolls away; the hero follows.",
      text: "Suddenly the egg rolled away - bump, bump, bump - down the hill. \"Wait for me!\" called {{name}}, running after it.",
      anchors: ["egg", "hill"],
      scene: { kind: "meadow", prompt: "An egg tumbling down a grassy hill with a child chasing", motifs: ["egg", "sun"] },
    },
    {
      beat: "Arrive in Dino Valley through a hidden tunnel.",
      text: "The egg tumbled through a tunnel of ferns and into a hidden place full of giant leaves and steaming mountains: Dino Valley!",
      anchors: ["valley"],
      scene: { kind: "volcano", prompt: "A lush prehistoric valley with ferns and a gentle smoking volcano", motifs: ["mountain", "trees"] },
    },
    {
      beat: "The egg hatches.",
      text: "CRACK! Out of the egg popped a baby {{dino}}. \"Hello,\" said {{name}}. \"I think I'll call you {{dinoName}}.\"",
      anchors: ["egg", "{{dinoName}}"],
      scene: { kind: "volcano", prompt: "A cute baby dinosaur hatching from a speckled egg", motifs: ["egg", "trees"] },
    },
    {
      beat: "The baby misses its family; they set off to find them.",
      text: "{{dinoName}} looked around and gave a little wobbly cry. \"Mama?\" {{name}} held {{dinoName}}'s tiny claw. \"Let's find your family.\"",
      anchors: ["family"],
      scene: { kind: "volcano", prompt: "The child holding the baby dinosaur's claw, setting off together", motifs: ["mountain", "trees"] },
    },
    {
      beat: "Play a game together along the way.",
      text: "On the way, they played {{game}} by the warm springs, giggling until their tummies hurt.",
      anchors: ["giggling"],
      scene: { kind: "volcano", prompt: "Child and baby dinosaur playing happily near warm springs", motifs: ["trees", "sun"] },
    },
    {
      beat: "Reunite the baby with its family.",
      text: "Then the ground went THUMP, THUMP. A huge, kind {{dino}} peeked over the trees. {{dinoName}} squeaked with joy - it was Mama!",
      anchors: ["mama"],
      scene: { kind: "volcano", prompt: "A huge gentle mother dinosaur greeting her baby", motifs: ["trees", "mountain"] },
    },
    {
      beat: "Goodbye and a promise to return.",
      text: "Mama gave {{name}} a ride all the way home. \"Come back and play soon,\" said {{dinoName}}. And {{name}} promised {{they}} would.",
      anchors: ["home", "promised"],
      scene: { kind: "meadow", prompt: "The child waving goodbye from atop a giant friendly dinosaur at sunset", motifs: ["sun", "house", "trees"] },
    },
  ],
};
