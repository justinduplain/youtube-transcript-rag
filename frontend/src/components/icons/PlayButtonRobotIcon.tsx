interface PlayButtonRobotIconProps {
  size?: number;
  className?: string;
}

export function PlayButtonRobotIcon({
  size = 32,
  className,
}: PlayButtonRobotIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -14 100 84"
      width={size * 1.19}
      height={size}
      style={{ overflow: 'visible' }}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* Rounded rectangle outer shape (YouTube-style) */}
      <rect
        x="2"
        y="2"
        width="96"
        height="66"
        rx="16"
        ry="16"
        fill="#cc0000"
        stroke="none"
      />

      {/* Left eye */}
      <circle cx="30" cy="28" r="7" fill="white" />
      <circle cx="31" cy="27" r="3" fill="#1a1a2e" />

      {/* Right eye */}
      <circle cx="70" cy="28" r="7" fill="white" />
      <circle cx="71" cy="27" r="3" fill="#1a1a2e" />

      {/* Play-button nose (center triangle) */}
      <polygon points="42,32 42,52 58,42" fill="white" />

      {/* Mouth */}
      <path
        d="M 32 55 Q 50 62 68 55"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Left antenna */}
      <line
        x1="30"
        y1="2"
        x2="22"
        y2="-8"
        stroke="#cc0000"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="22" cy="-8" r="3" fill="#cc0000" />

      {/* Right antenna */}
      <line
        x1="70"
        y1="2"
        x2="78"
        y2="-8"
        stroke="#cc0000"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="78" cy="-8" r="3" fill="#cc0000" />
    </svg>
  );
}
