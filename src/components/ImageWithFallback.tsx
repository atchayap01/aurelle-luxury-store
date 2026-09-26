import React, { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
  category?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = 'Aurelle luxury piece',
  fallbackTitle,
  category,
  className = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError || !src) {
    return (
      <div
        className={`w-full h-full min-h-[180px] bg-gradient-to-br from-[#F8F5EF] via-[#E8DED0] to-[#D6C2A5]/30 flex flex-col items-center justify-center p-6 text-center select-none ${className}`}
      >
        <span className="font-serif italic text-2xl text-[#A99B8C] tracking-widest mb-1">A</span>
        {category && (
          <span className="text-[10px] uppercase tracking-widest text-[#A99B8C] font-medium">
            {category}
          </span>
        )}
        {fallbackTitle && (
          <p className="text-xs text-[#2C2520] font-serif mt-1 max-w-[80%] line-clamp-1">
            {fallbackTitle}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden w-full h-full bg-[#F8F5EF] ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-[#E8DED0]/40 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        {...props}
      />
    </div>
  );
};
