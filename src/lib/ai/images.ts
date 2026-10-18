import "server-only";
import type { SceneSpec } from "../templates";

export interface IllustrationRequest {
  prompt: string;
  scene: SceneSpec;
  palette: { bg: string; accent: string };
  childName: string;
  childAppearance: string;
  pageNumber: number;
  /** Decrypted reference photos of the child, used only for likeness. Never persisted by providers. */
  referencePhotos: Array<{ data: Buffer; mime: string }>;
}

export interface Illustration {
  data: Buffer;
  mime: string;
}

export interface ImageProvider {
  name: string;
  illustrate(req: IllustrationRequest): Promise<Illustration>;
}

const SCENE_COLORS: Record<SceneSpec["kind"], [string, string]> = {
  sky: ["#8fd3fe", "#fff1c9"],
  space: ["#141a46", "#3b2f7a"],
  forest: ["#2f6b4f", "#9ad18b"],
  sea: ["#0f5e8c", "#4fc3dc"],
  meadow: ["#a8e6a1", "#fff3b0"],
  night: ["#0d1238", "#2b3a85"],
  volcano: ["#ff9a5a", "#ffe08a"],
  home: ["#ffd8b5", "#fff4e6"],
};

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function escapeXml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!);
}

/**
 * Offline illustrator used in development and tests: draws a simple storybook
 * scene as SVG from the page's scene spec. Replace with a real image model
 * (e.g. one that accepts reference photos for likeness) via `getImageProvider`.
 */
export const placeholderIllustrator: ImageProvider = {
  name: "placeholder",
  async illustrate(req) {
    const [top, bottom] = SCENE_COLORS[req.scene.kind];
    const rnd = seeded(req.pageNumber * 97 + req.childName.length * 13);
    const parts: string[] = [];
    const dark = ["space", "night", "sea"].includes(req.scene.kind);

    for (const motif of req.scene.motifs) {
      switch (motif) {
        case "stars":
          for (let i = 0; i < 28; i++) {
            const x = rnd() * 800, y = rnd() * 420, r = 1.5 + rnd() * 3;
            parts.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#fff6c8" opacity="${(0.5 + rnd() * 0.5).toFixed(2)}"/>`);
          }
          break;
        case "moon":
          parts.push(`<circle cx="650" cy="120" r="60" fill="#fff3c4"/><circle cx="630" cy="105" r="10" fill="#efdca0"/><circle cx="672" cy="140" r="7" fill="#efdca0"/>`);
          break;
        case "sun":
          parts.push(`<circle cx="660" cy="110" r="55" fill="#ffd34d"/><circle cx="660" cy="110" r="75" fill="#ffd34d" opacity="0.25"/>`);
          break;
        case "rocket":
          parts.push(`<g transform="translate(360 160) rotate(-20)"><rect x="-22" y="-60" width="44" height="110" rx="22" fill="${req.palette.accent}"/><circle cx="0" cy="-15" r="12" fill="#bfe6ff" stroke="#fff" stroke-width="4"/><path d="M-22 30 L-42 60 L-22 50 Z M22 30 L42 60 L22 50 Z" fill="#e8577e"/><path d="M-12 50 Q0 95 12 50 Z" fill="#ffb84d"/></g>`);
          break;
        case "trees":
          for (let i = 0; i < 6; i++) {
            const x = 40 + i * 140 + rnd() * 40, h = 120 + rnd() * 80;
            parts.push(`<rect x="${x - 8}" y="${520 - h * 0.4}" width="16" height="${h * 0.4}" fill="#6b4226"/><circle cx="${x}" cy="${520 - h * 0.55}" r="${h * 0.35}" fill="#3f8f5a"/>`);
          }
          break;
        case "fish":
          for (let i = 0; i < 6; i++) {
            const x = 80 + rnd() * 640, y = 120 + rnd() * 300, c = ["#ff8fab", "#ffd166", "#9be564", "#ffb84d"][i % 4];
            parts.push(`<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})"><ellipse rx="26" ry="14" fill="${c}"/><path d="M24 0 L42 -12 L42 12 Z" fill="${c}"/><circle cx="-12" cy="-3" r="3" fill="#2b2340"/></g>`);
          }
          break;
        case "bubbles":
          for (let i = 0; i < 16; i++) {
            parts.push(`<circle cx="${(rnd() * 800).toFixed(0)}" cy="${(rnd() * 500).toFixed(0)}" r="${(4 + rnd() * 12).toFixed(1)}" fill="none" stroke="#e6fbff" stroke-width="2" opacity="0.7"/>`);
          }
          break;
        case "flowers":
          for (let i = 0; i < 10; i++) {
            const x = 30 + rnd() * 740, y = 500 + rnd() * 60, c = ["#ff8fab", "#ffd166", "#c3a6ff"][i % 3];
            parts.push(`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="9" fill="${c}"/><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="3.5" fill="#fff6c8"/>`);
          }
          break;
        case "egg":
          parts.push(`<ellipse cx="420" cy="450" rx="55" ry="72" fill="#fff4dc" stroke="#d9c39a" stroke-width="3"/><circle cx="400" cy="430" r="8" fill="#9be564"/><circle cx="440" cy="465" r="10" fill="#9be564"/><circle cx="425" cy="410" r="6" fill="#9be564"/>`);
          break;
        case "mountain":
          parts.push(`<path d="M0 520 L180 260 L320 520 Z" fill="#6c5b7b" opacity="0.8"/><path d="M220 520 L460 220 L700 520 Z" fill="#594a6b" opacity="0.85"/>`);
          break;
        case "house":
          parts.push(`<rect x="70" y="390" width="150" height="130" fill="#ffd8b5"/><path d="M55 395 L145 320 L235 395 Z" fill="#e8577e"/><rect x="125" y="450" width="40" height="70" fill="#7a4b2a"/><rect x="85" y="415" width="30" height="30" fill="#fff3c4"/>`);
          break;
        case "cake":
          parts.push(`<rect x="330" y="380" width="160" height="90" rx="12" fill="#ff8fab"/><rect x="330" y="410" width="160" height="14" fill="#fff"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${352 + i * 28}" y="350" width="8" height="30" fill="#ffd166"/><circle cx="${356 + i * 28}" cy="344" r="6" fill="#ffb84d"/>`).join("")}`);
          break;
      }
    }

    const groundColor = req.scene.kind === "sea" ? "#e8d29b" : req.scene.kind === "space" ? "#9a94b8" : "#6cc070";
    const hero = `<g transform="translate(560 430)"><circle cx="0" cy="-70" r="34" fill="#f2c7a5"/><path d="M-34 -78 Q0 -120 34 -78 Q20 -95 0 -96 Q-20 -95 -34 -78Z" fill="#5a3a22"/><circle cx="-11" cy="-72" r="4" fill="#2b2340"/><circle cx="11" cy="-72" r="4" fill="#2b2340"/><path d="M-10 -56 Q0 -48 10 -56" stroke="#2b2340" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M-30 -30 Q0 -44 30 -30 L38 50 L-38 50 Z" fill="${req.palette.accent}"/></g>`;
    const caption = escapeXml(req.childName);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-label="${escapeXml(req.prompt)}">
<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs>
<rect width="800" height="600" fill="url(#bg)"/>
${parts.join("\n")}
<path d="M0 520 Q200 490 400 520 T800 515 L800 600 L0 600 Z" fill="${groundColor}"/>
${hero}
<text x="560" y="580" text-anchor="middle" font-family="Georgia, serif" font-size="20" fill="${dark ? "#fff8ef" : "#2b2340"}" opacity="0.8">${caption}</text>
</svg>`;
    return { data: Buffer.from(svg, "utf8"), mime: "image/svg+xml" };
  },
};

export function getImageProvider(): ImageProvider {
  // Plug a real provider in here (e.g. selected by IMAGE_PROVIDER env var).
  return placeholderIllustrator;
}
