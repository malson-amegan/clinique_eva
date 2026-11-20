import { useState } from 'react';
import { Building2 } from 'lucide-react';

interface AmbientImageProps {
  src: string;
  alt: string;
  className?: string;
  caption?: string;
  showBadgeCaption?: boolean;
}

export function AmbientImage({
  src,
  alt,
  className = '',
  caption,
  showBadgeCaption = false,
}: AmbientImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#DCEFE7] via-[#F5F8F6] to-[#E6F0EC] text-[#174B43] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Building2 className="w-8 h-8 mb-2 opacity-70" />
        <span className="text-xs font-medium text-[#233B4A]/80 max-w-xs">
          {caption || alt}
        </span>
      </div>
    );
  }

  return (
    <figure className="relative h-full w-full overflow-hidden">
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={() => setFailed(true)}
        className={`w-full h-full object-cover ${className}`}
      />
      {showBadgeCaption && caption && (
        <figcaption className="mt-2 text-xs text-[#233B4A]/70 leading-relaxed">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
