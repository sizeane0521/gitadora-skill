import { useRef, useState, useCallback } from "react";
import { Camera, Loader2, Sparkles, X, RotateCw } from "lucide-react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import ToggleGroup from "@/components/ToggleGroup";

type SourceType = "arcade" | "console";

interface FabCameraProps {
  onFileSelect: (file: File, source: SourceType) => void;
  loading?: boolean;
}

function getCroppedCanvas(
  image: HTMLImageElement,
  crop: PixelCrop,
  rotation: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const rotRad = (rotation * Math.PI) / 180;

  const natW = image.naturalWidth;
  const natH = image.naturalHeight;

  // Bounding box of rotated image at natural size
  const sin = Math.abs(Math.sin(rotRad));
  const cos = Math.abs(Math.cos(rotRad));
  const rotNatW = natW * cos + natH * sin;
  const rotNatH = natW * sin + natH * cos;

  // Draw full rotated image onto a temp canvas at natural resolution
  const tmp = document.createElement("canvas");
  tmp.width = Math.round(rotNatW);
  tmp.height = Math.round(rotNatH);
  const tCtx = tmp.getContext("2d")!;
  tCtx.translate(rotNatW / 2, rotNatH / 2);
  tCtx.rotate(rotRad);
  tCtx.drawImage(image, -natW / 2, -natH / 2);

  // The displayed (CSS) size of the image element (before CSS rotation)
  const displayW = image.width;
  const displayH = image.height;

  // After CSS rotation, the visible bounding box size is:
  const rotDisplayW = displayW * cos + displayH * sin;
  const rotDisplayH = displayW * sin + displayH * cos;

  // Scale from displayed-rotated coordinates to natural-rotated coordinates
  const scaleX = rotNatW / rotDisplayW;
  const scaleY = rotNatH / rotDisplayH;

  // Crop coordinates are relative to the displayed rotated image
  // But react-image-crop gives coordinates relative to the img element (pre-CSS-rotation)
  // The crop box is positioned over the visually rotated image, so we need to
  // account for the offset caused by CSS rotation within the element's bounding box

  // For 0° and 180°, element size ≈ rotated display size
  // For 90° and 270°, element stays displayW×displayH but visual is rotDisplayW×rotDisplayH
  // The visual is centered in the element's bounding box

  const offsetX = (displayW - rotDisplayW) / 2;
  const offsetY = (displayH - rotDisplayH) / 2;

  const cropNatX = (crop.x - offsetX) * scaleX;
  const cropNatY = (crop.y - offsetY) * scaleY;
  const cropNatW = crop.width * scaleX;
  const cropNatH = crop.height * scaleY;

  canvas.width = Math.round(cropNatW);
  canvas.height = Math.round(cropNatH);

  ctx.drawImage(
    tmp,
    Math.round(cropNatX),
    Math.round(cropNatY),
    Math.round(cropNatW),
    Math.round(cropNatH),
    0,
    0,
    canvas.width,
    canvas.height
  );

  return canvas;
}

export default function FabCamera({ onFileSelect, loading = false }: FabCameraProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [rotation, setRotation] = useState(0);
  const [source, setSource] = useState<SourceType>(() => {
    const saved = localStorage.getItem("fab-camera-source");
    return saved === "console" ? "console" : "arcade";
  });

  const handleSourceChange = (v: string) => {
    const val = v as SourceType;
    setSource(val);
    localStorage.setItem("fab-camera-source", val);
  };

  const handleClick = () => {
    if (loading) return;
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingFile(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
      setCrop(undefined);
      setCompletedCrop(undefined);
      setRotation(0);
      e.target.value = "";
    }
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget;
    // Default crop: full image
    const { width, height } = e.currentTarget;
    setCrop({ unit: "px", x: 0, y: 0, width, height });
  }, []);

  const handleConfirm = async () => {
    if (!imgRef.current || loading) return;

    try {
      const pixelCrop = completedCrop ?? {
        unit: "px" as const,
        x: 0,
        y: 0,
        width: imgRef.current.width,
        height: imgRef.current.height,
      };
      const canvas = getCroppedCanvas(imgRef.current, pixelCrop, rotation);
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", 0.92)
      );
      onFileSelect(new File([blob], "cropped.jpg", { type: "image/jpeg" }), source);
    } catch {
      if (pendingFile) onFileSelect(pendingFile, source);
    }
  };

  const handleCancel = () => {
    setPendingFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  // Clear pending after loading completes
  const prevLoadingRef = useRef(loading);
  if (prevLoadingRef.current && !loading && pendingFile) {
    setPendingFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  }
  prevLoadingRef.current = loading;

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      {/* Crop overlay */}
      {pendingFile && preview && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black/95">
          {/* Source toggle - above image */}
          <div className="px-4 pt-4 pb-2" style={{ paddingTop: "calc(env(safe-area-inset-top) + 1rem)" }}>
            <label className="text-xs font-body font-semibold text-muted-foreground mb-1 block">辨識版本</label>
            <ToggleGroup
              options={[
                { value: "arcade", label: "街機版" },
                { value: "console", label: "家用版" },
              ]}
              value={source}
              onChange={handleSourceChange}
            />
          </div>

          {/* Cropper area */}
          <div className="flex-1 min-h-0 flex items-center justify-center overflow-auto p-3">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              className="max-h-full"
            >
              <img
                ref={(el) => { imgRef.current = el; }}
                src={preview}
                alt="裁切預覽"
                onLoad={onImageLoad}
                style={{
                  maxWidth: "100%",
                  maxHeight: "calc(100vh - 260px)",
                  transform: `rotate(${rotation}deg)`,
                  transition: "transform 0.3s ease",
                }}
              />
            </ReactCrop>
          </div>

          {/* Controls */}
          <div
            className="w-full bg-card rounded-t-2xl p-4 space-y-3 animate-in slide-in-from-bottom-4 duration-300"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1.5rem)" }}
          >

            {/* Rotate button */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleRotate}
                className="flex items-center gap-1.5 px-4 h-10 rounded-lg bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                <RotateCw size={16} />
                旋轉 90°
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 min-h-[48px] rounded-md bg-muted text-muted-foreground text-sm font-display font-semibold hover:bg-muted/80 transition-colors disabled:opacity-50"
              >
                <X size={16} />
                取消
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 min-h-[48px] rounded-md bg-primary text-primary-foreground text-sm font-display font-bold shadow-[0_0_16px_hsl(var(--primary)/0.3)] hover:opacity-90 transition-all disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    AI 辨識中...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    開始辨識
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={handleClick}
        disabled={loading || !!pendingFile}
        className="fixed z-50 right-4 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_4px_24px_hsl(var(--primary)/0.4)] active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 7.5rem)" }}
        aria-label="拍照辨識"
      >
        {loading ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
      </button>
    </>
  );
}
