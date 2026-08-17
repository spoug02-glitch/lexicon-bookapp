export type AvailabilityStatus = "AVAILABLE" | "ON_LOAN" | "NOT_HELD";

const STATUS_CONFIG: Record<
  AvailabilityStatus,
  { label: string; dot: string; bg: string; text: string }
> = {
  AVAILABLE: {
    label: "대출가능",
    dot: "bg-primary",
    bg: "bg-secondary-container/30",
    text: "text-on-secondary-container",
  },
  ON_LOAN: {
    label: "대출중",
    dot: "bg-error",
    bg: "bg-error-container/30",
    text: "text-on-error-container",
  },
  NOT_HELD: {
    label: "소장없음",
    dot: "bg-outline",
    bg: "bg-surface-variant",
    text: "text-on-surface-variant",
  },
};

export function AvailabilityBadge({ status }: { status: AvailabilityStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full font-label-md text-label-md ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1.5`} />
      {cfg.label}
    </span>
  );
}
