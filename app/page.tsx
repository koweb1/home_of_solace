import DayCycle from "@/components/layout/DayCycle";
import Footer from "@/components/layout/Footer";
import HeroBackground from "@/components/sections/HeroBackground";
import House from "@/components/sections/House";
import Rooms from "@/components/sections/Rooms";
import Dining from "@/components/sections/Dining";
import Gallery from "@/components/sections/Gallery";
import Reserve from "@/components/sections/Reserve";

export default function Home() {
  return (
    <main>
      <DayCycle />

      <section
        id="top"
        data-tone="dawn"
        className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden px-6 text-center"
      >
        <HeroBackground />

        <p className="relative z-10 font-sans text-xs uppercase tracking-[0.3em] text-clay">
          Lagos
        </p>

        {/* Phone: a small "House of" above a large "Solace".
            Tablet and laptop: one line, as before */}
        <h1 className="relative z-10 font-serif leading-[0.92] tracking-[-0.02em] md:text-7xl md:leading-tight md:tracking-normal">
          <span className="block text-[2rem] md:inline md:text-[length:inherit]">
            House <em className="text-[0.7em]">of</em>
          </span>{" "}
          <span className="mt-1 block text-[5.25rem] md:mt-0 md:inline md:text-[length:inherit]">
            Solace
          </span>
        </h1>
      </section>

      <House />

      <Rooms />

      <Dining />

      <Gallery />

      <Reserve />

      <Footer />
    </main>
  );
}