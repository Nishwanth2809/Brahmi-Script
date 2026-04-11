import { useState } from "react";
import { Puzzle } from "lucide-react";

export interface CharacterPrediction {
  imageSrc: string;
  label: string;
  confidence: number;
  telugu: string;
  tamil: string;
  hindi: string;
}

interface CharacterGridProps {
  characters: CharacterPrediction[];
}

const ConfidenceBadge = ({ value }: { value: number }) => {
  const percent = Math.round(value * 100);
  const color =
    percent >= 90
      ? "text-success border-success/30 bg-success/10"
      : percent >= 70
      ? "text-gold border-gold/30 bg-gold/10"
      : "text-destructive border-destructive/30 bg-destructive/10";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${color}`}
    >
      {percent}%
    </span>
  );
};

const ConfidenceBar = ({ value }: { value: number }) => {
  const percent = Math.round(value * 100);
  const barColor =
    percent >= 90
      ? "bg-success"
      : percent >= 70
      ? "bg-gold"
      : "bg-destructive";

  return (
    <div className="w-full h-1.5 rounded-full bg-foreground/10 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};

const CharacterGrid = ({ characters }: CharacterGridProps) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const avgConfidence = characters.length
    ? Math.round((characters.reduce((sum, c) => sum + c.confidence, 0) / characters.length) * 100)
    : 0;

  return (
    <section className="max-w-5xl mx-auto px-4 animate-reveal" style={{ animationDelay: "0.2s" }}>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-medium mb-4 border border-gold/20">
          <Puzzle className="w-3 h-3" />
          Step 3
        </div>
        <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
          Segmentation & Predictions
        </h2>
        <p className="text-muted-foreground text-sm">
          Each character identified with confidence scores and transliterations
        </p>
        <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
          <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-gold/10 text-gold border border-gold/20">
            {characters.length} characters detected
          </span>
          <span className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${
            avgConfidence >= 90
              ? "bg-success/10 text-success border-success/20"
              : avgConfidence >= 70
              ? "bg-gold/10 text-gold border-gold/20"
              : "bg-destructive/10 text-destructive border-destructive/20"
          }`}>
            Avg. Confidence: {avgConfidence}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {characters.map((char, i) => (
          <div
            key={i}
            className={`glass-card rounded-xl p-3 transition-all duration-500 cursor-default animate-scale-in ancient-border ${
              hoveredIdx === i
                ? "glow-gold-strong scale-110 z-10 border-gold/50"
                : "hover:glow-gold hover:scale-105"
            }`}
            style={{ animationDelay: `${i * 0.06}s` }}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {/* Character Image */}
            <div className="w-full aspect-square rounded-lg overflow-hidden bg-foreground/90 mb-3 flex items-center justify-center">
              <img
                src={char.imageSrc}
                alt={char.label}
                className="w-full h-full object-contain p-1"
              />
            </div>

            {/* Label + Confidence Badge */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-sm text-gold text-glow">{char.label}</span>
              <ConfidenceBadge value={char.confidence} />
            </div>

            {/* Confidence Progress Bar */}
            <ConfidenceBar value={char.confidence} />

            {/* Translations */}
            <div className="space-y-1 mt-2">
              {[
                { lang: "Te", char: char.telugu, color: "text-success" },
                { lang: "Ta", char: char.tamil, color: "text-gold-light" },
                { lang: "Hi", char: char.hindi, color: "text-foreground" },
              ].map(({ lang, char: c, color }) => (
                <div
                  key={lang}
                  className="flex items-center justify-between text-[11px]"
                >
                  <span className="text-muted-foreground">{lang}:</span>
                  <span className={`font-medium ${color}`}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CharacterGrid;
