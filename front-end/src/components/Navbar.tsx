import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass-card border-b border-border/30">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="brand-logo" aria-hidden="true" />
          <span className="font-serif font-bold text-lg gold-text">Brahmi</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20 font-medium">
            v2.0
          </span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="#upload"
            className="text-sm text-muted-foreground hover:text-gold transition-colors duration-300"
          >
            Upload
          </a>
          <a
            href="#results"
            className="text-sm text-muted-foreground hover:text-gold transition-colors duration-300"
          >
            Results
          </a>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
