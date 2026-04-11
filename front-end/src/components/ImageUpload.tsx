import { useCallback, useState } from "react";
import { Upload, X, Image as ImageIcon, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
}

const ImageUpload = ({ onImageUpload }: ImageUploadProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
      onImageUpload(file);
    },
    [onImageUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearImage = () => {
    setPreview(null);
    setFileName("");
  };

  return (
    <section id="upload" className="max-w-3xl mx-auto px-4 scroll-mt-24">
      <div className="text-center mb-8 animate-slide-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-medium mb-4 border border-gold/20">
          <FileImage className="w-3 h-3" />
          Step 1
        </div>
        <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
          Upload an Image
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Drag & drop or browse for a Brahmi script image (PNG, JPG, JPEG)
        </p>
      </div>

      {!preview ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`
            relative group cursor-pointer rounded-2xl border-2 border-dashed
            transition-all duration-500 p-16 text-center ancient-border animate-scale-in
            ${
              dragOver
                ? "border-gold bg-gold/5 glow-gold-strong scale-[1.02]"
                : "border-border hover:border-gold/50 hover:bg-secondary/20 hover:glow-gold"
            }
          `}
        >
          <input
            type="file"
            accept="image/png,image/jpg,image/jpeg"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-5">
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                dragOver
                  ? "bg-gold/20 text-gold scale-110 glow-gold"
                  : "bg-secondary/50 text-muted-foreground group-hover:text-gold group-hover:bg-gold/10 group-hover:scale-105"
              }`}
            >
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <p className="font-semibold text-lg text-foreground">
                Drop your image here
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                or click to browse · PNG, JPG up to 200MB
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground/60 mt-2">
              {["High resolution", "Clear text", "Good lighting"].map((tip) => (
                <span key={tip} className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-gold/40" />
                  {tip}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-5 animate-scale-in glow-gold ancient-border">
          <div className="flex items-start gap-5">
            <div className="relative w-36 h-36 rounded-xl overflow-hidden border border-border flex-shrink-0 group">
              <img
                src={preview}
                alt="Upload preview"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
            </div>
            <div className="flex-1 min-w-0 py-1">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4 text-gold" />
                <span className="text-sm font-semibold text-foreground truncate">
                  {fileName}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <p className="text-xs text-success font-medium">
                  Ready to process
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearImage}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-4 h-4 mr-1" /> Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ImageUpload;
