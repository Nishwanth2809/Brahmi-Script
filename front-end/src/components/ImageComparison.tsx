import { Eye, Grid3X3 } from "lucide-react";

interface ImageComparisonProps {
  originalSrc: string;
  trackedSrc: string;
}

const ImageComparison = ({ originalSrc, trackedSrc }: ImageComparisonProps) => {
  return (
    <section id="results" className="max-w-5xl mx-auto px-4 scroll-mt-24 animate-reveal">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-medium mb-4 border border-gold/20">
          <Eye className="w-3 h-3" />
          Step 2
        </div>
        <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
          Image Analysis
        </h2>
        <p className="text-muted-foreground text-sm">
          Compare original with segmentation results
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {[
          { label: "Original Image", src: originalSrc, icon: <Eye className="w-4 h-4" /> },
          { label: "Segmented & Tracked", src: trackedSrc, icon: <Grid3X3 className="w-4 h-4" /> },
        ].map(({ label, src, icon }, idx) => (
          <div
            key={label}
            className="glass-card rounded-2xl overflow-hidden group hover:glow-gold transition-all duration-500 ancient-border animate-scale-in"
            style={{ animationDelay: `${idx * 0.15}s` }}
          >
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/50">
              <span className="text-gold">{icon}</span>
              <span className="text-sm font-semibold text-foreground">{label}</span>
            </div>
            <div className="p-4">
              <div className="overflow-hidden rounded-xl">
                <img
                  src={src}
                  alt={label}
                  className="w-full rounded-xl border border-border/20 transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ImageComparison;
