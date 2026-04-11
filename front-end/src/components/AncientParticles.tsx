import { useEffect, useRef } from "react";

const SYMBOLS = ["𑀅", "𑀆", "𑀇", "𑀈", "𑀓", "𑀔", "𑀕", "𑀖", "𑀗", "𑀘", "𑀩", "𑀫"];

interface Particle {
  x: number;
  y: number;
  size: number;
  symbol: string;
  speed: number;
  opacity: number;
  drift: number;
}

const AncientParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize particles
    for (let i = 0; i < 20; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 12 + Math.random() * 16,
        symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        speed: 0.15 + Math.random() * 0.3,
        opacity: 0.03 + Math.random() * 0.07,
        drift: (Math.random() - 0.5) * 0.3,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Get computed gold color
      const style = getComputedStyle(document.documentElement);
      const goldHSL = style.getPropertyValue("--gold").trim();

      particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.font = `${p.size}px serif`;
        ctx.fillStyle = `hsl(${goldHSL})`;
        ctx.fillText(p.symbol, p.x, p.y);
        ctx.restore();

        p.y -= p.speed;
        p.x += p.drift;

        if (p.y < -30) {
          p.y = canvas.height + 30;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -30) p.x = canvas.width + 30;
        if (p.x > canvas.width + 30) p.x = -30;
      });

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};

export default AncientParticles;
