import type { StoryTemplate } from "@/lib/templates";

/** Template preview cover drawn with CSS (no child imagery is ever shown publicly). */
export function BookCover({ template, title, size = "md" }: { template: StoryTemplate; title?: string; size?: "sm" | "md" | "lg" }) {
  const h = size === "sm" ? "h-40" : size === "lg" ? "h-80" : "h-56";
  const text = title ?? template.title.replace("{{name}}", "Your Child");
  return (
    <div className={`relative ${h} overflow-hidden rounded-2xl shadow-[inset_8px_0_0_rgba(0,0,0,0.15)]`} style={{ background: `linear-gradient(160deg, ${template.palette.bg}, ${template.palette.bg}cc 60%, ${template.palette.accent}99)` }}>
      <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-80" style={{ background: template.palette.accent }} />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-5">
        <p className="font-display text-xl font-bold leading-tight text-white drop-shadow sm:text-2xl">{text}</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-white/80">Ages {template.ageRange}</p>
      </div>
    </div>
  );
}
