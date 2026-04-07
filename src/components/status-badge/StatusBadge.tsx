import styles from "./StatusBadge.module.css";

export type StatusBadgeTone = "active" | "done" ;

type StatusBadgeProps = {
  label: string;
  tone?: StatusBadgeTone;
  className?: string;
};

const toneClassMap: Record<StatusBadgeTone, string> = {
  active: styles.toneActive,
  done: styles.toneCompleted,
};

export default function StatusBadge({
  label,
  tone = "active",
  className = "",
}: StatusBadgeProps) {
  const badgeClass = [styles.badge, toneClassMap[tone], className]
    .filter(Boolean)
    .join(" ");

  return <span className={badgeClass}>{label}</span>;
}
