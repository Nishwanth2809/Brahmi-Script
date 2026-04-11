import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

const ErrorBanner = ({ message, onDismiss }: ErrorBannerProps) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 animate-slide-up">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30">
        <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 animate-pulse" />
        <p className="text-sm text-destructive flex-1">{message}</p>
        <button
          onClick={() => {
            setVisible(false);
            onDismiss?.();
          }}
          className="p-1 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ErrorBanner;
