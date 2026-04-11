import heroImage from "@/assets/brahmi-hero.jpg";
import { ChevronDown } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background layers */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Ancient Brahmi script"
          className="w-full h-full object-cover opacity-20 scale-105 animate-[float_20s_ease-in-out_infinite]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />
      </div>

      {/* Ambient glow orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[500px] h-[500px] rounded-full animate-glow-pulse"
          style={{
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "radial-gradient(circle, hsl(var(--gold) / 0.08) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute w-[300px] h-[300px] rounded-full animate-float"
          style={{
            bottom: "10%",
            left: "20%",
            background: "radial-gradient(circle, hsl(var(--gold) / 0.05) 0%, transparent 70%)",
            animationDelay: "2s",
          }}
        />
      </div>

      {/* Floating ancient symbols */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {["𑀅", "𑀆", "𑀇", "𑀈", "𑀓", "𑀔"].map((sym, i) => (
          <span
            key={i}
            className="absolute text-gold/[0.06] text-4xl animate-float select-none"
            style={{
              left: `${10 + i * 16}%`,
              top: `${15 + (i % 3) * 25}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${5 + i * 0.8}s`,
              fontSize: `${28 + i * 6}px`,
            }}
          >
            {sym}
          </span>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="animate-slide-up">
          <span className="inline-block px-5 py-2 rounded-full text-xs font-medium tracking-[0.25em] uppercase border border-gold/30 text-gold mb-8 bg-gold/5 backdrop-blur-sm ancient-border">
            Ancient Script Recognition
          </span>
        </div>

        <h1
          className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-6 animate-slide-up leading-tight"
          style={{ animationDelay: "0.15s" }}
        >
          <span className="gold-text text-glow">Brahmi</span>{" "}
          <span className="text-foreground">Script</span>
          <br />
          <span className="text-foreground">Recognizer</span>
        </h1>

        <p
          className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          Upload an image of Brahmi text and watch AI segment each character,
          predict its identity, and translate it across{" "}
          <span className="text-gold font-medium">Telugu</span>,{" "}
          <span className="text-gold font-medium">Tamil</span> &{" "}
          <span className="text-gold font-medium">Devanagari</span> scripts.
        </p>

        {/* Pipeline steps */}
        <div
          className="mt-12 flex items-center justify-center gap-4 md:gap-8 text-sm animate-slide-up"
          style={{ animationDelay: "0.45s" }}
        >
          {["Segmentation", "Classification", "Translation"].map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              {i > 0 && (
                <div className="hidden md:block w-8 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
              )}
              <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-full">
                <span className="w-6 h-6 rounded-full bg-gold/15 text-gold text-xs flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{step}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div
          className="mt-16 animate-slide-up"
          style={{ animationDelay: "0.6s" }}
        >
          <a href="#upload" className="inline-flex flex-col items-center gap-1 text-muted-foreground hover:text-gold transition-colors">
            <span className="text-xs tracking-widest uppercase">Explore</span>
            <ChevronDown className="w-5 h-5 animate-scroll-hint" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
