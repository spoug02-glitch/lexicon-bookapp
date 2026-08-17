const SIZE_CLASSES = {
  sm: "w-16 h-24",
  md: "w-[84px] h-[120px]",
  lg: "w-40 md:w-56 aspect-[2/3]",
} as const;

interface BookCoverProps {
  src?: string | null;
  alt: string;
  size?: keyof typeof SIZE_CLASSES;
}

export function BookCover({ src, alt, size = "md" }: BookCoverProps) {
  return (
    <div
      className={`${SIZE_CLASSES[size]} shrink-0 rounded-md overflow-hidden bg-surface-container-high relative`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="w-full h-full object-cover absolute inset-0" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-on-surface-variant/60">
          <span className="material-symbols-outlined text-[28px]">menu_book</span>
        </div>
      )}
    </div>
  );
}
