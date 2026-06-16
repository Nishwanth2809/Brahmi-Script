import { useState, useCallback, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import AncientParticles from "@/components/AncientParticles";
import ImageUpload from "@/components/ImageUpload";
import ProcessingOverlay from "@/components/ProcessingOverlay";
import ImageComparison from "@/components/ImageComparison";
import CharacterGrid from "@/components/CharacterGrid";
import type { CharacterPrediction } from "@/components/CharacterGrid";
import TranslationPanel from "@/components/TranslationPanel";
import ErrorBanner from "@/components/ErrorBanner";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface ApiResponse {
  predictions: {
    label: string;
    confidence: number;
    char_image: string;
    telugu: string;
    tamil: string;
    hindi: string;
  }[];
  tracked_image: string;
  telugu_sequence: string;
  tamil_sequence: string;
  hindi_sequence: string;
  error?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, "") ?? "";

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [trackedImage, setTrackedImage] = useState<string | null>(null);
  const [results, setResults] = useState<{
    characters: CharacterPrediction[];
    telugu: string;
    tamil: string;
    devanagari: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setUploadedImage(e.target?.result as string);
    reader.readAsDataURL(file);
    setUploadedFile(file);
    setResults(null);
    setTrackedImage(null);
    setError(null);
  }, []);

  const [isWakingUp, setIsWakingUp] = useState(false);
  const [wakeUpCountdown, setWakeUpCountdown] = useState(0);

  // Pre-warm the Render backend on page load and keep it alive every 10 minutes.
  // Render free tier spins down after 15 min of inactivity — this prevents cold starts.
  useEffect(() => {
    const ping = () => {
      fetch(`${API_BASE_URL}/api/health`)
        .then(() => {/* warm-up request sent — response not needed */})
        .catch(() => {/* silent — server may be sleeping, that's expected */});
    };
    ping(); // immediate warm-up on mount
    const id = setInterval(ping, 10 * 60 * 1000); // every 10 minutes
    return () => clearInterval(id);
  }, []);

  const MAX_WAKE_UP_ATTEMPTS = 48; // 240 seconds — Render free tier can take 90-180s to cold-start with TensorFlow

  const waitForBackend = useCallback(async (): Promise<boolean> => {
    const maxAttempts = MAX_WAKE_UP_ATTEMPTS;
    for (let i = 0; i < maxAttempts; i++) {
      setWakeUpCountdown(maxAttempts - i);
      try {
        const res = await fetch(`${API_BASE_URL}/api/health`);
        // 200 OK means the server is fully up and the model is loaded
        if (res.status === 200) return true;
        // 502/503 means still starting — keep waiting
      } catch {
        // Network error / CORS block — server is still sleeping
      }
      await new Promise((r) => setTimeout(r, 5000));
    }
    return false;
  }, []);

  const handleProcess = async () => {
    if (!uploadedFile) return;
    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", uploadedFile);

    const doFetch = async () => {
      const res = await fetch(`${API_BASE_URL}/api/process`, {
        method: "POST",
        body: formData,
      });

      const isJson = res.headers.get("content-type")?.includes("application/json");
      const data = isJson ? ((await res.json()) as ApiResponse) : null;

      if (!res.ok || data?.error) {
        throw new Error(data?.error || `Processing failed (${res.status})`);
      }

      if (!data) {
        throw new Error("Processing failed: backend returned an empty response.");
      }

      return data;
    };

    try {
      let data: ApiResponse;
      try {
        data = await doFetch();
      } catch (firstErr) {
        // Detect Render cold-start: network failures (CORS block on sleeping Render)
        // or HTTP 502/503 gateway errors from Vercel proxy or direct Render calls.
        const isGatewayError =
          (firstErr instanceof TypeError && firstErr.message === "Failed to fetch") ||
          (firstErr instanceof Error &&
            (firstErr.message.includes("502") || firstErr.message.includes("503")));

        if (isGatewayError) {
          setIsWakingUp(true);
          const isUp = await waitForBackend();
          setIsWakingUp(false);
          setWakeUpCountdown(0);
          if (!isUp) {
            throw new Error(
              "The backend is taking too long to start. Please wait a moment and try again."
            );
          }
          data = await doFetch();
        } else {
          throw firstErr;
        }
      }

      const characters: CharacterPrediction[] = data.predictions.map((p) => ({
        imageSrc: p.char_image,
        label: p.label,
        confidence: p.confidence,
        telugu: p.telugu,
        tamil: p.tamil,
        hindi: p.hindi,
      }));

      setTrackedImage(data.tracked_image);
      setResults({
        characters,
        telugu: data.telugu_sequence,
        tamil: data.tamil_sequence,
        devanagari: data.hindi_sequence,
      });
    } catch (err) {
      let message = "Failed to process image. Please try again.";
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        message =
          "Could not reach the backend. It may be waking up — please wait 30 seconds and try again.";
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setIsProcessing(false);
      setIsWakingUp(false);
      setWakeUpCountdown(0);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <AncientParticles />
      <Navbar />
      <HeroSection />

      <div className="relative z-10 space-y-20 pb-24">
        {/* Upload Section */}
        <div className="space-y-8">
          <ImageUpload onImageUpload={handleImageUpload} />

          {uploadedImage && !results && (
            <div className="flex justify-center animate-scale-in">
              <Button
                onClick={handleProcess}
                disabled={isProcessing}
                size="lg"
                className="gap-3 gold-gradient text-background font-bold px-10 py-7 text-lg rounded-2xl glow-gold-strong transition-all duration-500 hover:scale-105 hover:shadow-[0_0_60px_hsl(var(--gold)/0.3)] active:scale-95"
              >
                <Sparkles className="w-5 h-5" />
                Process Image
              </Button>
            </div>
          )}
        </div>

        {/* Error */}
        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        {/* Results */}
        {results && (
          <div className="space-y-20">
            <ImageComparison
              originalSrc={uploadedImage!}
              trackedSrc={trackedImage || uploadedImage!}
            />
            <CharacterGrid characters={results.characters} />
            <TranslationPanel
              characters={results.characters}
              telugu={results.telugu}
              tamil={results.tamil}
              devanagari={results.devanagari}
            />
          </div>
        )}
      </div>

      {/* Processing Overlay */}
      <ProcessingOverlay
        isVisible={isProcessing}
        isWakingUp={isWakingUp}
        wakeUpCountdown={wakeUpCountdown}
        maxWakeUpAttempts={MAX_WAKE_UP_ATTEMPTS}
      />

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 py-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="brand-logo brand-logo-sm" aria-hidden="true" />
          <span className="font-serif font-bold gold-text">Brahmi</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Ancient Script Recognizer - Powered by Deep Learning
        </p>
      </footer>
    </div>
  );
};

export default Index;
