import { useState, memo } from "react";
import { Music } from "lucide-react";
import { getCdnThumbnail } from "@/lib/imageProxy";

interface SongCoverImageProps {
  src: string;
  alt: string;
  className?: string;
}

function SongCoverImageInner({ src, alt, className = "" }: SongCoverImageProps) {
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");
  const cdnUrl = getCdnThumbnail(src, 150);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Skeleton pulse – visible until loaded */}
      {state === "loading" && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded-lg" />
      )}

      {/* Error fallback */}
      {state === "error" && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center rounded-lg">
          <Music className="text-muted-foreground" size={24} />
        </div>
      )}

      {/* Real image – hidden until onLoad fires */}
      {cdnUrl && state !== "error" && (
        <img
          src={cdnUrl}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            state === "loaded" ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setState("loaded")}
          onError={() => setState("error")}
        />
      )}

      {/* No URL at all */}
      {!cdnUrl && state !== "error" && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center rounded-lg">
          <Music className="text-muted-foreground" size={24} />
        </div>
      )}
    </div>
  );
}

const SongCoverImage = memo(SongCoverImageInner);
export default SongCoverImage;
