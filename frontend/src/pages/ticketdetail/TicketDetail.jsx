
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getTicketById,
  updateTicketStatus,
} from "../../services/ticketService";
import styles from "./TicketDetail.module.css";

function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [history, setHistory] = useState([]);

  const [status, setStatus] = useState("");
  const [remark, setRemark] = useState("");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          navigate("/login");
          return;
        }

        const data = await getTicketById(id);

        setTicket(data.ticket);
        setHistory(data.status_history || []);
        setStatus(data.ticket.status);
      } catch (err) {
        setError(
          err.message || "Failed to load ticket"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, navigate]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();

    if (!status) {
      setError("Please select a status.");
      return;
    }

    if (!remark.trim()) {
      setError("Please enter a remark.");
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      await updateTicketStatus(
        id,
        status,
        remark.trim()
      );

      setRemark("");

      setSuccess(
        "Ticket status updated successfully."
      );

      const data = await getTicketById(id);

      setTicket(data.ticket);
      setHistory(data.status_history || []);
      setStatus(data.ticket.status);
    } catch (err) {
      setError(
        err.message ||
          "Failed to update ticket"
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.centerMessage}>
        Loading ticket...
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className={styles.centerMessage}>
        <p>{error}</p>

        <button
          className={styles.backButton}
          onClick={() =>
            navigate("/admin/tickets")
          }
        >
          Back to Tickets
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1>SmartDesk</h1>
          <p>Ticket Details</p>
        </div>

        <button
          className={styles.backHeaderButton}
          onClick={() =>
            navigate("/admin/tickets")
          }
        >
          Back to Tickets
        </button>
      </header>

      <main className={styles.content}>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {success && (
          <div className={styles.success}>
            {success}
          </div>
        )}

        {/* Ticket Header */}
        <section className={styles.ticketHeader}>

          <div>
            <span className={styles.reference}>
              {ticket.reference_number}
            </span>

            <h2>{ticket.subject}</h2>
          </div>

          <span
            className={`${styles.statusBadge} ${
              styles[
                ticket.status
                  ?.toLowerCase()
                  .replace(/\s+/g, "")
              ]
            }`}
          >
            {ticket.status}
          </span>

        </section>

        <div className={styles.grid}>

          {/* Customer */}
          <section className={styles.card}>
            <h3>Customer Information</h3>

            <div className={styles.infoRow}>
              <span>Name</span>
              <strong>{ticket.name}</strong>
            </div>

            <div className={styles.infoRow}>
              <span>Email</span>
              <strong>{ticket.email}</strong>
            </div>
          </section>

          {/* Ticket Information */}
          <section className={styles.card}>
            <h3>Ticket Information</h3>

            <div className={styles.infoRow}>
              <span>Reference</span>
              <strong>
                {ticket.reference_number}
              </strong>
            </div>

            <div className={styles.infoRow}>
              <span>Category</span>
              <strong>
                {ticket.category}
              </strong>
            </div>

            <div className={styles.infoRow}>
              <span>Priority</span>
              <strong>
                {ticket.priority}
              </strong>
            </div>

            <div className={styles.infoRow}>
              <span>Created</span>
              <strong>
                {ticket.created_at
                  ? new Date(
                      ticket.created_at
                    ).toLocaleString()
                  : "-"}
              </strong>
            </div>
          </section>

          {/* Description */}
          <section className={styles.cardFull}>
            <h3>Customer Description</h3>

            <p className={styles.description}>
              {ticket.description}
            </p>
          </section>

          {/* AI Suggestions */}
          <section
            className={`${styles.cardFull} ${styles.aiCard}`}
          >
            <div className={styles.aiHeader}>

              <div>
                <h3>AI Suggestions</h3>

                <p>
                  Gemini classification generated
                  during ticket creation.
                </p>
              </div>

              <span className={styles.aiBadge}>
                AI
              </span>

            </div>

            <div className={styles.aiGrid}>

              <div className={styles.aiItem}>
                <span>Category</span>

                <strong>
                  {ticket.category}
                </strong>
              </div>

              <div className={styles.aiItem}>
                <span>Priority</span>

                <strong>
                  {ticket.priority}
                </strong>
              </div>

              <div className={styles.aiItemSummary}>
                <span>Summary</span>

                <p>
                  {ticket.summary ||
                    "No AI summary available."}
                </p>
              </div>

            </div>
          </section>

          {/* Update Status */}
          <section className={styles.card}>
            <h3>Update Status</h3>

            <form onSubmit={handleUpdateStatus}>

              <div className={styles.formGroup}>
                <label htmlFor="status">
                  Status
                </label>

                <select
                  id="status"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                >
                  <option value="Open">
                    Open
                  </option>

                  <option value="In Progress">
                    In Progress
                  </option>

                  <option value="Resolved">
                    Resolved
                  </option>

                  <option value="Closed">
                    Closed
                  </option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="remark">
                  Remark
                </label>

                <textarea
                  id="remark"
                  rows="5"
                  placeholder="Enter a remark..."
                  value={remark}
                  onChange={(e) =>
                    setRemark(e.target.value)
                  }
                />
              </div>

              <button
                type="submit"
                className={styles.updateButton}
                disabled={updating}
              >
                {updating
                  ? "Updating..."
                  : "Update Status"}
              </button>

            </form>
          </section>

          {/* Status History */}
          <section className={styles.card}>
            <h3>Status History</h3>

            {history.length === 0 ? (
              <p className={styles.emptyHistory}>
                No status changes recorded yet.
              </p>
            ) : (
              <div className={styles.historyList}>

                {history.map((item) => (
                  <div
                    className={styles.historyItem}
                    key={item.id}
                  >

                    <div
                      className={styles.historyTop}
                    >
                      <strong>
                        {item.old_status}
                        {" → "}
                        {item.new_status}
                      </strong>

                      <span>
                        {item.changed_at
                          ? new Date(
                              item.changed_at
                            ).toLocaleString()
                          : "-"}
                      </span>
                    </div>

                    <p>{item.remark}</p>

                    <small>
                      Changed by:{" "}
                      {item.changed_by}
                    </small>

                  </div>
                ))}

              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}

export default TicketDetail;
