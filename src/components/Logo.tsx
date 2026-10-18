export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
        <rect x="2" y="5" width="30" height="24" rx="6" fill="#e8577e" />
        <path d="M17 8 V27" stroke="#fff8ef" strokeWidth="2.5" />
        <path d="M6 10 Q11.5 8 16 10 V25 Q11.5 23 6 25Z" fill="#fff8ef" />
        <path d="M28 10 Q22.5 8 18 10 V25 Q22.5 23 28 25Z" fill="#ffd166" />
        <circle cx="26" cy="7" r="3.2" fill="#ffb84d" />
      </svg>
      <span className="font-display text-xl font-bold tracking-tight">
        Kidz<span className="text-berry">stories</span>
      </span>
    </span>
  );
}
