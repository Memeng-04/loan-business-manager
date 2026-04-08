import { ChevronLeft } from "lucide-react";
import Button from "../../Button";
import Card from "../../card/Card";
import styles from "./BorrowerDetailCards.module.css";

type BorrowerProfileCardProps = {
  name: string;
  onBack: () => void;
};

export default function BorrowerProfileCard({
  name,
  onBack,
}: BorrowerProfileCardProps) {
  return (
    <Card className={styles.profileCard}>
      <div>
        <p className={styles.sectionEyebrow}>BORROWER PROFILE</p>
        <h2 className={styles.profileName}>{name}</h2>
      </div>

      <Button
        variant="outline"
        size="md"
        className={`mt-0! ${styles.profileBackButton}`}
        onClick={onBack}
      >
        <ChevronLeft size={20} />
        Back to borrowers
      </Button>
    </Card>
  );
}
