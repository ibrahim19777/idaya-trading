export function IdayaLogo({ className = "w-32 h-8", variant = "full" }: { 
  className?: string; 
  variant?: "full" | "icon" | "text" 
}) {
  if (variant === "icon") {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <svg viewBox="0 0 40 40" className="w-full h-full">
          {/* الدائرة الخارجية */}
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="url(#gradient1)"
            stroke="url(#gradient2)"
            strokeWidth="2"
          />
          
          {/* شكل الماس في المنتصف */}
          <path
            d="M20 8 L28 16 L20 24 L12 16 Z"
            fill="white"
            opacity="0.9"
          />
          
          {/* خط الذكاء الاصطناعي */}
          <path
            d="M14 20 Q20 14 26 20 Q20 26 14 20"
            stroke="url(#gradient3)"
            strokeWidth="2"
            fill="none"
            opacity="0.8"
          />
          
          {/* النقاط التقنية */}
          <circle cx="16" cy="18" r="1.5" fill="white" opacity="0.7" />
          <circle cx="24" cy="18" r="1.5" fill="white" opacity="0.7" />
          <circle cx="20" cy="22" r="1.5" fill="white" opacity="0.7" />
          
          {/* التدرجات */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#1D4ED8" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (variant === "text") {
    return (
      <div className={`${className} flex items-center`}>
        <span className="text-2xl logo-text text-blue-800 dark:text-blue-400" style={{ fontWeight: 900 }}>
          IDAYA
        </span>
        <span className="text-xs text-muted-foreground ml-1 font-medium">AI Trading</span>
      </div>
    );
  }

  // Full logo (icon + text)
  return (
    <div className={`${className} flex items-center gap-3`}>
      <IdayaLogo variant="icon" className="w-8 h-8" />
      <div className="flex flex-col">
        <span className="text-xl logo-text text-blue-800 dark:text-blue-400 leading-none" style={{ fontWeight: 900 }}>
          IDAYA
        </span>
        <span className="text-[10px] text-muted-foreground font-medium leading-none mt-0.5">
          AI Trading Platform
        </span>
      </div>
    </div>
  );
}