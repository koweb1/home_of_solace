export default function HouseScene() {
  return (
    <svg
      viewBox="0 0 600 800"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      role="img"
      aria-label="Illustration of a quiet pool in front of an arched villa in morning light"
    >
      <defs>
        <linearGradient id="house-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F6E3C4" />
          <stop offset="1" stopColor="#FBF3E2" />
        </linearGradient>
        <linearGradient id="house-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A9B8D6" />
          <stop offset="1" stopColor="#5C6BA6" />
        </linearGradient>
        <radialGradient id="house-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#F4D3AE" stopOpacity="0.9" />
          <stop offset="1" stopColor="#F4D3AE" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sky, glow and sun */}
      <rect width="600" height="800" fill="url(#house-sky)" />
      <circle cx="430" cy="200" r="230" fill="url(#house-glow)" />
      <circle cx="430" cy="200" r="64" fill="#F0C9A0" />

      {/* Villa */}
      <rect x="60" y="440" width="480" height="120" fill="#1B2559" />
      <g fill="#E8B98F">
        <path d="M110 560V500a35 35 0 0 1 70 0v60Z" />
        <path d="M265 560V500a35 35 0 0 1 70 0v60Z" />
        <path d="M420 560V500a35 35 0 0 1 70 0v60Z" />
      </g>
      <rect x="40" y="432" width="520" height="10" fill="#0E1433" />

      {/* Pool */}
      <rect y="560" width="600" height="170" fill="url(#house-water)" />
      <g stroke="#F1E8D8" strokeWidth="2" strokeLinecap="round" opacity="0.45">
        <path d="M70 600h110" />
        <path d="M250 620h150" />
        <path d="M120 650h90" />
        <path d="M330 676h160" />
        <path d="M60 700h70" />
        <path d="M430 706h90" />
      </g>

      {/* Deck */}
      <rect y="730" width="600" height="70" fill="#E4D3BA" />
      <rect y="726" width="600" height="6" fill="#CBB596" />

      {/* Palm leaves from the top corner */}
      <g stroke="#0E1433" strokeLinecap="round" fill="none" strokeWidth="5">
        <path d="M-10 70 Q 90 60 150 140" />
        <path d="M-10 70 Q 70 20 160 40" />
        <path d="M-10 70 Q 50 120 70 210" />
        <path d="M-10 70 Q 110 90 210 70" />
      </g>
    </svg>
  );
}