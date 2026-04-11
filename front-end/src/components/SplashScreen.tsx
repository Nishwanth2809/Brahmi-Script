import { useEffect, useState } from "react";

const ancientSymbols = ["𑀅", "𑀆", "𑀇", "𑀈", "𑀉", "𑀊", "𑀓", "𑀔", "𑀕", "𑀖", "𑀗", "𑀘"];

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState(0); // 0=symbols, 1=title, 2=fade-out
  const [visibleSymbols, setVisibleSymbols] = useState<number[]>([]);

  useEffect(() => {
    // Stagger symbol appearances
    ancientSymbols.forEach((_, i) => {
      setTimeout(() => setVisibleSymbols((p) => [...p, i]), i * 80);
    });
    setTimeout(() => setPhase(1), 1200);
    setTimeout(() => setPhase(2), 2800);
    setTimeout(onComplete, 3400);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-600 ${
        phase === 2 ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`w-[600px] h-[600px] rounded-full transition-all duration-1000 ${
            phase >= 1
              ? "opacity-30 scale-100"
              : "opacity-0 scale-50"
          }`}
          style={{
            background:
              "radial-gradient(circle, hsl(var(--gold) / 0.2) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Orbiting symbols */}
      <div className="absolute inset-0 flex items-center justify-center">
        {ancientSymbols.map((sym, i) => {
          const angle = (i / ancientSymbols.length) * 360;
          const radius = phase >= 1 ? 180 : 120;
          return (
            <span
              key={i}
              className={`absolute text-2xl transition-all duration-700 ${
                visibleSymbols.includes(i)
                  ? phase >= 1
                    ? "opacity-20 scale-75"
                    : "opacity-60 scale-100"
                  : "opacity-0 scale-0"
              }`}
              style={{
                color: "hsl(var(--gold))",
                transform: `rotate(${angle}deg) translateY(-${radius}px) rotate(-${angle}deg)`,
                transitionDelay: `${i * 30}ms`,
              }}
            >
              {sym}
            </span>
          );
        })}
      </div>

      {/* Center content */}
      <div className="relative z-10 text-center">
        <div
          className={`transition-all duration-700 ${
            phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-3">
            <span className="gold-text">𑀩𑁆𑀭𑀸𑀳𑁆𑀫𑀻</span>
          </h1>
          <div
            className={`transition-all duration-500 delay-300 ${
              phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <p className="text-lg text-muted-foreground tracking-[0.3em] uppercase font-light">
              Script Recognizer
            </p>
          </div>
        </div>

        {/* Loading bar */}
        <div
          className={`mt-8 mx-auto w-48 h-0.5 rounded-full bg-border overflow-hidden transition-opacity duration-500 ${
            phase >= 1 ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="h-full rounded-full transition-all ease-out"
            style={{
              width: phase >= 1 ? "100%" : "0%",
              transitionDuration: "1600ms",
              background:
                "linear-gradient(90deg, hsl(var(--gold)), hsl(var(--gold-light)), hsl(var(--gold)))",
            }}
          />
        </div>
      </div>

      {/* Corner decorations */}
      {[0, 1, 2, 3].map((corner) => (
        <div
          key={corner}
          className={`absolute w-16 h-16 transition-all duration-1000 delay-500 ${
            phase >= 1 ? "opacity-20" : "opacity-0"
          }`}
          style={{
            top: corner < 2 ? "2rem" : undefined,
            bottom: corner >= 2 ? "2rem" : undefined,
            left: corner % 2 === 0 ? "2rem" : undefined,
            right: corner % 2 === 1 ? "2rem" : undefined,
            borderTop: corner < 2 ? "1px solid hsl(var(--gold) / 0.4)" : undefined,
            borderBottom: corner >= 2 ? "1px solid hsl(var(--gold) / 0.4)" : undefined,
            borderLeft: corner % 2 === 0 ? "1px solid hsl(var(--gold) / 0.4)" : undefined,
            borderRight: corner % 2 === 1 ? "1px solid hsl(var(--gold) / 0.4)" : undefined,
          }}
        />
      ))}
    </div>
  );
};

export default SplashScreen;
