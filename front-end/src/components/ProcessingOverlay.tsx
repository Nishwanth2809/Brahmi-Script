import { useEffect, useState } from "react";

const steps = [
  { label: "Preprocessing image", icon: "🔍", detail: "Enhancing contrast & removing noise" },
  { label: "Segmenting characters", icon: "✂️", detail: "Isolating individual glyphs" },
  { label: "Running classification model", icon: "🧠", detail: "Deep learning inference" },
  { label: "Mapping translations", icon: "🌐", detail: "Cross-script transliteration" },
];

interface ProcessingOverlayProps {
  isVisible: boolean;
  isWakingUp?: boolean;
  wakeUpCountdown?: number;
  maxWakeUpAttempts?: number;
}

const ProcessingOverlay = ({ isVisible, isWakingUp = false, wakeUpCountdown = 0, maxWakeUpAttempts = 48 }: ProcessingOverlayProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(95, p + 0.4));
    }, 40);

    const interval = setInterval(() => {
      setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
    }, 1100);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl animate-fade-in">
      {/* Background glow */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full animate-glow-pulse"
        style={{
          background: "radial-gradient(circle, hsl(var(--gold) / 0.1) 0%, transparent 70%)",
        }}
      />

      <div className="relative text-center max-w-md px-6 w-full">
        {/* Spinner */}
        <div className="relative w-24 h-24 mx-auto mb-10">
          <div className="absolute inset-0 rounded-full border-2 border-border/50" />
          <div className="absolute inset-0 rounded-full border-2 border-t-gold border-r-transparent border-b-transparent border-l-transparent animate-spin-slow" />
          <div
            className="absolute inset-2 rounded-full border-2 border-t-transparent border-r-gold-light border-b-transparent border-l-transparent animate-spin-slow"
            style={{ animationDirection: "reverse", animationDuration: "2s" }}
          />
          <div className="absolute inset-4 rounded-full border border-gold/10" />
          <span className="absolute inset-0 flex items-center justify-center text-3xl animate-pulse">
            {steps[currentStep].icon}
          </span>
        </div>

        <h3 className="text-2xl font-serif font-bold text-foreground mb-2 text-glow">
          {isWakingUp ? "Waking Up Server" : "Processing Your Image"}
        </h3>
        <p className="text-sm text-muted-foreground mb-8">
          {isWakingUp
            ? `The backend is starting up on Render's free tier. This may take up to 3 minutes\u2026`
            : "Analyzing ancient Brahmi script patterns..."}
        </p>

        {/* Global progress bar */}
        <div className="w-full h-1 rounded-full bg-border/50 mb-8 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out gold-gradient"
            style={{ width: isWakingUp ? `${((maxWakeUpAttempts - wakeUpCountdown) / maxWakeUpAttempts) * 100}%` : `${progress}%` }}
          />
        </div>

        {/* Steps or wake-up message */}
        {isWakingUp ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gold/10 border border-gold/20 glow-gold">
            <span className="text-2xl animate-pulse">⏳</span>
            <div>
              <span className="text-sm font-semibold text-gold block">Server is cold-starting</span>
              <span className="text-xs text-muted-foreground">Render free tier spins down after inactivity. Hang tight!</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-left">
            {steps.map((step, i) => (
              <div
                key={step.label}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 ${
                  i < currentStep
                    ? "bg-success/10 border border-success/20"
                    : i === currentStep
                    ? "bg-gold/10 border border-gold/20 glow-gold"
                    : "opacity-40"
                }`}
                style={{
                  transitionDelay: `${i * 50}ms`,
                }}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-500 ${
                    i < currentStep
                      ? "bg-success/20 text-success"
                      : i === currentStep
                      ? "bg-gold/20 text-gold"
                      : "bg-border/30 text-muted-foreground"
                  }`}
                >
                  {i < currentStep ? "✓" : i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <span
                    className={`text-sm font-semibold block ${
                      i < currentStep
                        ? "text-success"
                        : i === currentStep
                        ? "text-gold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                  {i === currentStep && (
                    <span className="text-xs text-muted-foreground animate-fade-in">
                      {step.detail}
                    </span>
                  )}
                </div>
                {i === currentStep && (
                  <span className="flex gap-1">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"
                        style={{ animationDelay: `${d * 0.2}s` }}
                      />
                    ))}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessingOverlay;
