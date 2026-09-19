import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardStats } from "../../services/dashboardService";
import styles from "./Dashboard.module.css";

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardStats = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getDashboardStats();

        setStats(data);
      } catch (err) {
        setError(
          err.message || "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className={styles.centerMessage}>
        <div className={styles.loader}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.centerMessage}>
        <div className={styles.errorBox}>
          <h2>Unable to Load Dashboard</h2>
          <p>{error}</p>

          <button
            className={styles.retryButton}
            onClick={handleRetry}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const statusCounts = stats?.status_counts || {};
  const categoryCounts = stats?.category_counts || {};
  const priorityCounts = stats?.priority_counts || {};

  const totalTickets = Object.values(statusCounts).reduce(
    (total, count) => total + Number(count),
    0
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.logo}>SmartDesk</h1>
          <p className={styles.headerSubtitle}>
            Admin Dashboard
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            className={styles.ticketsButton}
            onClick={() => navigate("/admin/tickets")}
          >
            View Tickets
          </button>

          <button
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className={styles.content}>
        <div className={styles.welcome}>
          <h2>Dashboard Overview</h2>
          <p>
            Monitor support tickets and their current status.
          </p>
        </div>

        <section className={styles.cardsGrid}>
          <div className={styles.card}>
            <span className={styles.cardLabel}>
              Total Tickets
            </span>
            <strong className={styles.cardValue}>
              {totalTickets}
            </strong>
          </div>

          <div className={styles.card}>
            <span className={styles.cardLabel}>
              Open
            </span>
            <strong className={styles.cardValue}>
              {statusCounts["Open"] || 0}
            </strong>
          </div>

          <div className={styles.card}>
            <span className={styles.cardLabel}>
              In Progress
            </span>
            <strong className={styles.cardValue}>
              {statusCounts["In Progress"] || 0}
            </strong>
          </div>

          <div className={styles.card}>
            <span className={styles.cardLabel}>
              Resolved
            </span>
            <strong className={styles.cardValue}>
              {statusCounts["Resolved"] || 0}
            </strong>
          </div>

          <div className={styles.card}>
            <span className={styles.cardLabel}>
              Closed
            </span>
            <strong className={styles.cardValue}>
              {statusCounts["Closed"] || 0}
            </strong>
          </div>

          <div className={styles.card}>
            <span className={styles.cardLabel}>
              Last 7 Days
            </span>
            <strong className={styles.cardValue}>
              {stats?.last_7_days || 0}
            </strong>
          </div>
        </section>

        <section className={styles.statsGrid}>
          <div className={styles.statsCard}>
            <div className={styles.statsHeader}>
              <h3>Tickets by Category</h3>
            </div>

            <div className={styles.statsList}>
              <div className={styles.statRow}>
                <span>Technical</span>
                <strong>
                  {categoryCounts["Technical"] || 0}
                </strong>
              </div>

              <div className={styles.statRow}>
                <span>Billing</span>
                <strong>
                  {categoryCounts["Billing"] || 0}
                </strong>
              </div>

              <div className={styles.statRow}>
                <span>Account</span>
                <strong>
                  {categoryCounts["Account"] || 0}
                </strong>
              </div>

              <div className={styles.statRow}>
                <span>General</span>
                <strong>
                  {categoryCounts["General"] || 0}
                </strong>
              </div>
            </div>
          </div>

          <div className={styles.statsCard}>
            <div className={styles.statsHeader}>
              <h3>Tickets by Priority</h3>
            </div>

            <div className={styles.statsList}>
              <div className={styles.statRow}>
                <span>High</span>
                <strong>
                  {priorityCounts["High"] || 0}
                </strong>
              </div>

              <div className={styles.statRow}>
                <span>Medium</span>
                <strong>
                  {priorityCounts["Medium"] || 0}
                </strong>
              </div>

              <div className={styles.statRow}>
                <span>Low</span>
                <strong>
                  {priorityCounts["Low"] || 0}
                </strong>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;