import { useState } from "react";
import { Check, Copy, Download, Languages } from "lucide-react";
import type { CharacterPrediction } from "@/components/CharacterGrid";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/sonner";

interface TranslationPanelProps {
  characters: CharacterPrediction[];
  telugu: string;
  tamil: string;
  devanagari: string;
}

const scripts = [
  { key: "telugu" as const, label: "Telugu", symbol: "తె", color: "text-success" },
  { key: "tamil" as const, label: "Tamil", symbol: "த", color: "text-gold" },
  { key: "devanagari" as const, label: "Devanagari", symbol: "दे", color: "text-gold-light" },
];

const TranslationPanel = ({ characters, telugu, tamil, devanagari }: TranslationPanelProps) => {
  const [copied, setCopied] = useState<string | null>(null);
  const values = { telugu, tamil, devanagari };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const recognizedSequence = characters.map((character) => character.label).join(" ");

  const downloadFile = (filename: string, contents: string, mimeType: string) => {
    const blob = new Blob([contents], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownload = (format: "json" | "txt") => {
    const generatedAt = new Date().toISOString();
    const filenameBase = `brahmi-results-${generatedAt.replace(/[:.]/g, "-")}`;

    if (format === "json") {
      const payload = {
        generatedAt,
        characterCount: characters.length,
        recognizedSequence,
        translations: values,
        characters: characters.map((character, index) => ({
          index: index + 1,
          label: character.label,
          confidence: Number(character.confidence.toFixed(4)),
          telugu: character.telugu,
          tamil: character.tamil,
          devanagari: character.hindi,
        })),
      };

      downloadFile(
        `${filenameBase}.json`,
        JSON.stringify(payload, null, 2),
        "application/json;charset=utf-8",
      );
    } else {
      const lines = [
        "Brahmi Recognition Results",
        `Generated: ${generatedAt}`,
        `Recognized Sequence: ${recognizedSequence || "N/A"}`,
        `Telugu: ${telugu || "N/A"}`,
        `Tamil: ${tamil || "N/A"}`,
        `Devanagari: ${devanagari || "N/A"}`,
        "",
        "Characters:",
        ...characters.map(
          (character, index) =>
            `${index + 1}. ${character.label} (${Math.round(character.confidence * 100)}%) | ` +
            `Te: ${character.telugu} | Ta: ${character.tamil} | Hi: ${character.hindi}`,
        ),
      ];

      downloadFile(
        `${filenameBase}.txt`,
        lines.join("\n"),
        "text/plain;charset=utf-8",
      );
    }

    toast.success(`Downloaded results as ${format.toUpperCase()}`);
  };

  return (
    <section className="max-w-5xl mx-auto px-4 animate-reveal" style={{ animationDelay: "0.4s" }}>
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-medium mb-4 border border-gold/20">
            <Languages className="w-3 h-3" />
            Step 4
          </div>
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
            Final Sequence
          </h2>
          <p className="text-muted-foreground text-sm">
            Complete transliteration across three modern scripts
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="self-center md:self-auto gap-2 rounded-xl border-gold/30 bg-background/70 px-5 hover:border-gold hover:bg-gold/10"
            >
              <Download className="w-4 h-4" />
              Download Results
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => handleDownload("json")}>
              Download JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload("txt")}>
              Download Text
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {scripts.map(({ key, label, symbol, color }, idx) => (
          <div
            key={key}
            className="glass-card rounded-2xl overflow-hidden group hover:glow-gold-strong transition-all duration-500 ancient-border animate-scale-in"
            style={{ animationDelay: `${idx * 0.12}s` }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <span className={`text-2xl font-serif font-bold ${color}`}>
                  {symbol}
                </span>
                <div>
                  <span className="text-sm font-semibold text-foreground block">
                    {label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">Script</span>
                </div>
              </div>
              <button
                onClick={() => handleCopy(key, values[key])}
                className="p-2 rounded-lg hover:bg-secondary transition-all duration-300 text-muted-foreground hover:text-gold hover:scale-110 active:scale-95"
                title={`Copy ${label} text`}
              >
                {copied === key ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="p-5">
              <p className={`text-xl font-medium ${color} leading-relaxed tracking-wider`}>
                {values[key]}
              </p>
            </div>
            {copied === key && (
              <div className="px-5 pb-3 animate-fade-in">
                <span className="text-xs text-success font-medium">✓ Copied to clipboard</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default TranslationPanel;
