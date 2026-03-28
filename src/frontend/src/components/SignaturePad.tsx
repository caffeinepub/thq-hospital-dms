import { PenLine, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface SignaturePadProps {
  value: string | undefined;
  onChange: (dataUrl: string | undefined) => void;
}

export default function SignaturePad({ value, onChange }: SignaturePadProps) {
  const [mode, setMode] = useState<"draw" | "upload">("draw");
  const [isDrawing, setIsDrawing] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | undefined>(value);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (value && mode === "draw") {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = value;
    }
  }, [value, mode]);

  useEffect(() => {
    if (mode === "draw") initCanvas();
  }, [mode, initCanvas]);

  function getPos(
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function startDraw(
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  }

  function draw(
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#ffffff";
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function stopDraw() {
    setIsDrawing(false);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onChange(undefined);
  }

  function saveSignature() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onChange(dataUrl);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setUploadPreview(url);
      onChange(url);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="rounded-xl border border-border bg-black/40 p-4 space-y-3">
      {/* Tabs */}
      <div className="flex gap-2">
        {(["draw", "upload"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              mode === m
                ? "bg-primary text-black"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "draw" ? <PenLine size={12} /> : <Upload size={12} />}
            {m === "draw" ? "Draw" : "Upload"}
          </button>
        ))}
      </div>

      {mode === "draw" && (
        <div className="space-y-2">
          <canvas
            ref={canvasRef}
            width={400}
            height={160}
            className="w-full rounded-lg border border-border/50 cursor-crosshair touch-none"
            style={{ background: "#0a0a0a" }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
          <p className="text-xs text-muted-foreground">
            Draw your signature above
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={clearCanvas}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={12} /> Clear
            </button>
            <button
              type="button"
              onClick={saveSignature}
              className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-primary text-black text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              Save Signature
            </button>
          </div>
        </div>
      )}

      {mode === "upload" && (
        <div className="space-y-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            className="hidden"
            onChange={handleFileUpload}
          />
          {uploadPreview ? (
            <div className="space-y-2">
              <img
                src={uploadPreview}
                alt="Signature preview"
                className="h-20 object-contain rounded-lg border border-border/50 bg-white p-1"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUploadPreview(undefined);
                    onChange(undefined);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={12} /> Remove
                </button>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Upload size={12} /> Change
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 w-full h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-primary transition-colors"
            >
              <Upload size={20} />
              <span className="text-xs">
                Click to upload signature image (PNG/JPG, max 2MB)
              </span>
            </button>
          )}
        </div>
      )}

      {value && (
        <p className="text-xs text-primary font-medium">✓ Signature saved</p>
      )}
    </div>
  );
}
