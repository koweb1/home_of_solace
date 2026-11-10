import HeroBackground from "@/components/sections/HeroBackground";

const sections = [
  { id: "house", label: "The House" },
  { id: "rooms", label: "Rooms" },
  { id: "dining", label: "Dining" },
  { id: "gallery", label: "Gallery" },
  { id: "reserve", label: "Reserve" },
];

export default function Home() {
  return (
    <main>
      <section
        id="top"
        className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden px-6 text-center"
      >
        <HeroBackground />

        <p className="relative z-10 font-sans text-xs uppercase tracking-[0.3em] text-clay">
          Lagos
        </p>
        <h1 className="relative z-10 font-serif text-5xl leading-tight md:text-7xl">
          House <em className="text-[0.7em]">of</em> Solace
        </h1>
      </section>


      

      {sections.map((s) => (
        <section
          key={s.id}
          id={s.id}
          className="flex min-h-screen items-center justify-center border-t border-sky-fg/10"
        >
          <p className="font-serif text-4xl">{s.label}</p>
        </section>
      ))}
    </main>
  );
}