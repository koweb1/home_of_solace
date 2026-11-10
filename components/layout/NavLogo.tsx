export default function NavLogo() {
  return (
    <span className="flex items-center gap-3">
      <svg
        viewBox="0 0 120 160"
        className="h-7 w-[21px]"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="nav-arch-clip">
            <path d="M20 150V70a40 40 0 0 1 80 0v80Z" />
          </clipPath>
        </defs>
        <g clipPath="url(#nav-arch-clip)">
          <circle cx="60" cy="150" r="22" fill="#A65A41" />
        </g>
        <path
          d="M20 150V70a40 40 0 0 1 80 0v80"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M8 150H112"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-serif text-xl leading-none md:text-2xl">
        House <em className="text-[0.75em]">of</em> Solace
      </span>
    </span>
  );
}