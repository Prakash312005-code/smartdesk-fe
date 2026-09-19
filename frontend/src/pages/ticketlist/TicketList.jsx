import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./TicketList.module.css";
import {
  getTickets,
  exportTicketsCsv,
} from "../../services/ticketService";

function TicketList() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totalPages = Math.ceil(total / pageSize);

  useEffect(() => {
    const fetchTickets = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getTickets({
          page,
          pageSize,
          search,
          status,
          category,
          priority,
        });

        setTickets(data.tickets || []);
        setTotal(data.total || 0);
      } catch (err) {
        setError(
          err.message || "Failed to load tickets"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [
    page,
    pageSize,
    search,
    status,
    category,
    priority,
    navigate,
  ]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1);
  };

  const handlePriorityChange = (e) => {
    setPriority(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setCategory("");
    setPriority("");
    setPage(1);
  };

  const handleExportCsv = async () => {
    try {
      setError("");

      await exportTicketsCsv({
        search,
        status,
        category,
        priority,
      });
    } catch (err) {
      setError(
        err.message || "Failed to export tickets"
      );
    }
  };

  const getPriorityClass = (ticketPriority) => {
    return (
      styles[ticketPriority?.toLowerCase()] ||
      ""
    );
  };

  const getStatusClass = (ticketStatus) => {
    return (
      styles[
        ticketStatus
          ?.toLowerCase()
          .replace(/\s+/g, "")
      ] || ""
    );
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>SmartDesk</h1>
          <p>Ticket Management</p>
        </div>

        <button
          className={styles.dashboardButton}
          onClick={() => navigate("/admin/dashboard")}
        >
          Dashboard
        </button>
      </header>

      <main className={styles.content}>
        <div className={styles.titleSection}>
          <div>
            <h2>All Tickets</h2>
            <p>
              Search and manage customer support tickets.
            </p>
          </div>

          <div className={styles.actions}>
            <span className={styles.total}>
              Total: {total}
            </span>

            <button
              type="button"
              className={styles.exportButton}
              onClick={handleExportCsv}
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className={styles.filterCard}>
          <div className={styles.searchBox}>
            <label htmlFor="search">
              Search
            </label>

            <input
              id="search"
              type="text"
              placeholder="Reference, name, email or subject"
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="status">
              Status
            </label>

            <select
              id="status"
              value={status}
              onChange={handleStatusChange}
            >
              <option value="">All</option>
              <option value="Open">Open</option>
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

          <div className={styles.filterGroup}>
            <label htmlFor="category">
              Category
            </label>

            <select
              id="category"
              value={category}
              onChange={handleCategoryChange}
            >
              <option value="">All</option>
              <option value="Technical">
                Technical
              </option>
              <option value="Billing">
                Billing
              </option>
              <option value="Account">
                Account
              </option>
              <option value="General">
                General
              </option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="priority">
              Priority
            </label>

            <select
              id="priority"
              value={priority}
              onChange={handlePriorityChange}
            >
              <option value="">All</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <button
            type="button"
            className={styles.clearButton}
            onClick={clearFilters}
          >
            Clear
          </button>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <div className={styles.tableCard}>
          {loading ? (
            <div className={styles.message}>
              Loading tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div className={styles.message}>
              No tickets found.
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Customer</th>
                    <th>Subject</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className={styles.reference}>
                        {ticket.reference_number}
                      </td>

                      <td>
                        <div className={styles.customer}>
                          <strong>
                            {ticket.name}
                          </strong>

                          <span>
                            {ticket.email}
                          </span>
                        </div>
                      </td>

                      <td className={styles.subject}>
                        {ticket.subject}
                      </td>

                      <td>
                        {ticket.category}
                      </td>

                      <td>
                        <span
                          className={`${styles.badge} ${getPriorityClass(
                            ticket.priority
                          )}`}
                        >
                          {ticket.priority}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`${styles.badge} ${getStatusClass(
                            ticket.status
                          )}`}
                        >
                          {ticket.status}
                        </span>
                      </td>

                      <td>
                        {ticket.created_at
                          ? new Date(
                              ticket.created_at
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>
                        <button
                          type="button"
                          className={styles.viewButton}
                          onClick={() =>
                            navigate(
                              `/admin/tickets/${ticket.id}`
                            )
                          }
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 0 && (
          <div className={styles.pagination}>
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default TicketList;