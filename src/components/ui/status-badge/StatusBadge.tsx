import styles from "./StatusBadge.module.css";

export type StatusBadgeTone =
  | "active"
  | "done"
  | "unpaid"
  | "paid"
  | "partial"
  | "missed";

type StatusBadgeProps = {
  label: string;
  tone?: StatusBadgeTone;
  className?: string;
};

const toneClassMap: Record<StatusBadgeTone, string> = {
  active: styles.toneUnpaid,
  unpaid: styles.toneUnpaid,
  done: styles.tonePaid,
  paid: styles.tonePaid,
  partial: styles.tonePartial,
  missed: styles.toneMissed,
};

export default function StatusBadge({
  label,
  tone = "unpaid",
  className = "",
}: StatusBadgeProps) {
  const badgeClass = [styles.badge, toneClassMap[tone], className]
    .filter(Boolean)
    .join(" ");

  return <span className={badgeClass}>{label}</span>;
}
