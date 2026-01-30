export function Logo({ className }: { className?: string }) {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
    >
      <rect x="0" y="0" width="64" height="64" rx="16" ry="16" fill="currentColor" />
      <line
        x1="18"
        y1="19"
        x2="46"
        y2="19"
        fill="none"
        stroke="white"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <line
        x1="18"
        y1="32"
        x2="34"
        y2="32"
        fill="none"
        stroke="white"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <circle cx="45" cy="32" r="3.5" fill="white" />
      <line
        x1="18"
        y1="45"
        x2="26"
        y2="45"
        fill="none"
        stroke="white"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  )
}
