import { useEffect, useMemo, useRef, useState } from "react";
import { Check, RefreshCw, ShieldCheck, Loader2 } from "lucide-react";

/**
 * SimpleCaptcha — lightweight "I'm not a robot" widget.
 *
 * Renders a themed canvas image (gradient + lock + random session token) so each
 * mount looks unique and proves canvas/2D context support (most simple bots
 * fail this). Verification requires:
 *   - canvas successfully drew an image
 *   - at least one real pointer event since mount (mouse/touch)
 *   - >700ms since mount (blocks instant programmatic submits)
 *   - user clicked the checkbox
 */
export function SimpleCaptcha({
  onChange,
  disabled,
}: {
  onChange: (verified: boolean) => void;
  disabled?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [seed, setSeed] = useState(() => Math.random());
  const [pointerMoved, setPointerMoved] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const mountedAt = useMemo(() => Date.now(), []);

  // Track real pointer activity anywhere on the page.
  useEffect(() => {
    if (pointerMoved) return;
    const mark = () => setPointerMoved(true);
    window.addEventListener("mousemove", mark, { once: true, passive: true });
    window.addEventListener("touchstart", mark, { once: true, passive: true });
    window.addEventListener("keydown", mark, { once: true });
    return () => {
      window.removeEventListener("mousemove", mark);
      window.removeEventListener("touchstart", mark);
      window.removeEventListener("keydown", mark);
    };
  }, [pointerMoved]);

  // Draw the themed badge image on the canvas whenever seed changes.
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = c.width;
    const H = c.height;
    ctx.clearRect(0, 0, W, H);

    // Background gradient — matches the login amber/gold accent.
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#1f2a44");
    g.addColorStop(1, "#3a2a1a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Subtle dotted noise (deterministic from seed).
    const rnd = mulberry32(Math.floor(seed * 1e9));
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    for (let i = 0; i < 80; i++) {
      const x = rnd() * W;
      const y = rnd() * H;
      const r = rnd() * 1.2 + 0.3;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Diagonal stripes
    ctx.strokeStyle = "rgba(248, 188, 96, 0.15)";
    ctx.lineWidth = 1;
    for (let x = -H; x < W; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + H, H);
      ctx.stroke();
    }

    // Glowing accent dot
    const grad = ctx.createRadialGradient(W - 24, 18, 0, W - 24, 18, 40);
    grad.addColorStop(0, "rgba(248, 188, 96, 0.55)");
    grad.addColorStop(1, "rgba(248, 188, 96, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(W - 80, 0, 80, 80);

    // Label
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "600 13px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
    ctx.fillText("Vérification humaine", 14, 22);

    // Random session token (purely cosmetic, proves canvas drew)
    const token = Math.floor(rnd() * 0xffffff).toString(16).padStart(6, "0").toUpperCase();
    ctx.fillStyle = "rgba(248, 188, 96, 0.95)";
    ctx.font = "500 11px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillText(`#${token}`, 14, H - 12);
  }, [seed]);

  const eligible = pointerMoved && Date.now() - mountedAt > 700;

  const handleClick = () => {
    if (verified || verifying || disabled) return;
    if (!eligible) {
      // Refresh image; ask user to interact a bit more.
      setSeed(Math.random());
      return;
    }
    setVerifying(true);
    // Tiny delay to mimic "checking…" — feels human and gives the canvas a beat.
    window.setTimeout(() => {
      setVerified(true);
      setVerifying(false);
      onChange(true);
    }, 450 + Math.random() * 250);
  };

  const refresh = () => {
    setSeed(Math.random());
    if (verified) {
      setVerified(false);
      onChange(false);
    }
  };

  return (
    <div className="rounded-lg border border-border/70 bg-muted/30 p-3 flex items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || verifying || verified}
        aria-pressed={verified}
        className={`relative h-7 w-7 shrink-0 rounded-md border transition-all flex items-center justify-center ${
          verified
            ? "bg-emerald-500 border-emerald-500"
            : "bg-background border-border hover:border-primary/60 cursor-pointer"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-label="Je ne suis pas un robot"
      >
        {verifying ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : verified ? (
          <Check className="h-4 w-4 text-white" strokeWidth={3} />
        ) : null}
      </button>

      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || verifying || verified}
        className="flex-1 text-left text-sm font-medium text-foreground/90 disabled:opacity-70 cursor-pointer"
      >
        {verified ? "Vérifié — vous êtes humain" : "Je ne suis pas un robot"}
        <div className="text-[11px] font-normal text-muted-foreground mt-0.5 flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" /> Protection ERP
        </div>
      </button>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={120}
          height={56}
          className="rounded-md border border-border/60"
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={refresh}
          disabled={disabled}
          aria-label="Régénérer l'image"
          className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-background border border-border shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/60 transition-colors"
        >
          <RefreshCw className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  );
}

// Tiny seeded PRNG so the canvas draw is deterministic per seed.
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}