import Button from "../../ui/Button";
import Card from "../../ui/card/Card";
import styles from "./BorrowerDetailCards.module.css";

type BorrowerProfileCardProps = {
  name: string;
  onBack?: () => void;
  onViewProfile?: () => void;
};

export default function BorrowerProfileCard({
  name,
  onBack,
  onViewProfile,
}: BorrowerProfileCardProps) {
  const handleBack = onBack || (() => window.history.back());

  return (
    <Card className={styles.profileCard}>
      <div>
        <p className={styles.sectionEyebrow}>BORROWER PROFILE</p>
        <h2 className={styles.profileName}>{name}</h2>
      </div>
      <div className={styles.profileActions}>
        <Button
          variant="back"
          size="sm"
          className={styles.profileBackButton}
          onClick={handleBack}
        >
          Back
        </Button>

        {onViewProfile && (
          <Button
            variant="blue"
            size="sm"
            className={styles.profileViewButton}
            onClick={onViewProfile}
          >
            View Profile
          </Button>
        )}
      </div>
    </Card>
  );
}
