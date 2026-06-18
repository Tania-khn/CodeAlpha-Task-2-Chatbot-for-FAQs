import { cn } from '@/lib/utils';

/**
 * Brand logo mark — an abstract "stacked tasks / chat bubble" mark.
 *
 * The shape is two overlapping rounded squares (one rotated) inside a
 * gradient tile. Drawn in pure SVG so it stays crisp at any size, in
 * both light and dark themes (it doesn't depend on currentColor for the
 * gradient — the gradient is baked in).
 */
export function BrandLogo({
  size = 36,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-xl shadow-sm overflow-hidden',
        className,
      )}
      style={{
        width: size,
        height: size,
        background:
          'linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #0d9488 100%)',
      }}
      aria-hidden="true"
    >
      <svg
        width={size * 0.62}
        height={size * 0.62}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* A stylized "C" for CloudTask, made from a chat bubble + checkmark */}
        <path
          d="M5 4h11a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H10l-4 3v-3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z"
          fill="white"
          fillOpacity="0.95"
        />
        <path
          d="M7.5 9.5l2.2 2.2 4.3-4.3"
          stroke="#0d9488"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

/**
 * Full brand lockup — logo + wordmark. Used on the landing page, the
 * chat header, and the footer.
 *
 * The wordmark uses a gradient text fill that matches the logo tile.
 */
export function BrandLockup({
  size = 36,
  showTagline = false,
  className,
}: {
  size?: number;
  showTagline?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <BrandLogo size={size} />
      <div className="leading-tight">
        <div
          className="font-bold tracking-tight text-base sm:text-lg"
          style={{
            backgroundImage:
              'linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #0d9488 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          CloudTask
        </div>
        {showTagline && (
          <div className="text-[10px] sm:text-[11px] text-muted-foreground -mt-0.5">
            FAQ Assistant
          </div>
        )}
      </div>
    </div>
  );
}
