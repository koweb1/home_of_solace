type ImagePlaceholderProps = {
  path: string;
  ratio?: string;
  shape?: "arch" | "box";
};

export default function ImagePlaceholder({
  path,
  ratio = "Portrait · 3:4",
  shape = "arch",
}: ImagePlaceholderProps) {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-3 border border-ivory/20 bg-gradient-to-b from-[#2A3670] to-[#1B2559] px-8 text-center text-ivory/60 ${
        shape === "arch" ? "rounded-t-full" : ""
      }`}
    >
      <span className="text-[0.65rem] uppercase tracking-[0.3em]">
        Photo goes here
      </span>
      <span className="break-all font-serif text-lg italic text-ivory/80">
        {path}
      </span>
      <span className="text-[0.65rem] uppercase tracking-[0.3em]">
        {ratio}
      </span>
    </div>
  );
}