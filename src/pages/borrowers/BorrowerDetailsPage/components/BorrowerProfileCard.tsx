import { ArrowLeft } from "lucide-react";
import Button from "../../../../components/Button";
import Card from "../../../../components/card/Card";
import styles from "./BorrowerDetailCards.module.css";

type BorrowerProfileCardProps = {
  name: string;
  contact: string;
  onBack: () => void;
};

export default function BorrowerProfileCard({
  name,
  contact,
  onBack,
}: BorrowerProfileCardProps) {
  return (
    <Card className={styles.profileCard}>
      <div>
        <p className={styles.sectionEyebrow}>BORROWER PROFILE</p>
        <h2 className={styles.profileName}>{name}</h2>
        <p className={styles.profileContact}>{contact}</p>
      </div>

      <Button
        variant="outline"
        size="md"
        className={`mt-0! ${styles.profileBackButton}`}
        onClick={onBack}
      >
        <ArrowLeft size={16} />
        Back to borrowers
      </Button>
    </Card>
  );
}
