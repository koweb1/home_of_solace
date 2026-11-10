type LogoMarkProps = {
  className?: string;
};

export default function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 120 160"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <clipPath id="solace-arch-clip">
          <path d="M20 150V70a40 40 0 0 1 80 0v80Z" />
        </clipPath>
      </defs>

      {/* Rising half-sun, clipped to the inside of the arch */}
      <g clipPath="url(#solace-arch-clip)">
        <g className="logo-sun" style={{ opacity: 0 }}>
          <circle cx="60" cy="150" r="20" fill="#A65A41" />
        </g>
      </g>

      {/* Arch outline */}
      <path
        className="logo-arch"
        d="M20 150V70a40 40 0 0 1 80 0v80"
        pathLength={1}
        stroke="#F1E8D8"
        strokeWidth="1.5"
        strokeLinecap="round"
        style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
      />

      {/* Ground line */}
      <path
        className="logo-base"
        d="M8 150H112"
        pathLength={1}
        stroke="#F1E8D8"
        strokeWidth="1"
        strokeLinecap="round"
        style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
      />
    </svg>
  );
}