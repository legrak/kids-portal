/** A balloon of one colour on a string; scales to the width it gets. */
export function Balloon({ color, className = "" }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 100 150" aria-hidden="true" className={className}>
      <path
        d="M50 112 C 43 122, 57 132, 50 148"
        fill="none"
        stroke="#94a3b8"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* A thin dark edge, so the white balloon shows on the light page. */}
      <g fill={color} stroke="rgb(0 0 0 / 0.15)" strokeWidth="1.5">
        <path d="M50 4 C 22 4, 6 27, 6 53 C 6 80, 30 101, 50 106 C 70 101, 94 80, 94 53 C 94 27, 78 4, 50 4 Z" />
        <path d="M44 113 L 56 113 L 50 105 Z" />
      </g>
      <ellipse
        cx="31"
        cy="36"
        rx="8"
        ry="15"
        transform="rotate(-25 31 36)"
        fill="#fff"
        opacity="0.45"
      />
    </svg>
  );
}
