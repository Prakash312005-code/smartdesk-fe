import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Confirmation.module.css";

function Confirmation() {
  const location = useLocation();
  const navigate = useNavigate();

  const referenceNumber = location.state?.referenceNumber;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.successIcon}>✓</div>

        <h1>Ticket Raised Successfully!</h1>

        <p className={styles.message}>
          Your support ticket has been created successfully.
        </p>

        <div className={styles.referenceBox}>
          <span>Ticket Reference</span>
          <strong>{referenceNumber || "N/A"}</strong>
        </div>

        <p className={styles.info}>
          Our support team will review your ticket and get back to you.
        </p>

        <button
          className={styles.primaryButton}
          onClick={() => navigate("/")}
        >
          Raise Another Ticket
        </button>

        <button
          className={styles.secondaryButton}
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default Confirmation;