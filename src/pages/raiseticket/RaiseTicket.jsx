import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../../services/ticketService";
import styles from "./RaiseTicket.module.css";

function RaiseTicket() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setApiError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email
      )
    ) {
      newErrors.email =
        "Enter a valid email address";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.description.trim()) {
      newErrors.description =
        "Description is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setApiError("");

      const data = await createTicket({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        description: formData.description.trim(),
      });

      navigate("/confirmation", {
        state: {
          referenceNumber:
            data.ticket.reference_number,
        },
      });
    } catch (error) {
      setApiError(
        error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <header className={styles.header}>
          <div className={styles.logo}>
            Smart<span>Desk</span>
          </div>

          <p className={styles.tagline}>
            Simple. Smart. Support.
          </p>
        </header>

        <main className={styles.card}>
          <div className={styles.cardHeader}>
            <h1>Raise a Support Ticket</h1>

            <p>
              Tell us about your issue and our support
              team will get back to you.
            </p>
          </div>

          {apiError && (
            <div className={styles.apiError}>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            <div className={styles.formGroup}>
              <label htmlFor="name">
                Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                className={
                  errors.name
                    ? styles.inputError
                    : ""
                }
              />

              {errors.name && (
                <span className={styles.errorText}>
                  {errors.name}
                </span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className={
                  errors.email
                    ? styles.inputError
                    : ""
                }
              />

              {errors.email && (
                <span className={styles.errorText}>
                  {errors.email}
                </span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="subject">
                Subject
              </label>

              <input
                id="subject"
                name="subject"
                type="text"
                placeholder="Enter your issue subject"
                value={formData.subject}
                onChange={handleChange}
                className={
                  errors.subject
                    ? styles.inputError
                    : ""
                }
              />

              {errors.subject && (
                <span className={styles.errorText}>
                  {errors.subject}
                </span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                name="description"
                rows="6"
                placeholder="Describe your issue in detail..."
                value={formData.description}
                onChange={handleChange}
                className={
                  errors.description
                    ? styles.inputError
                    : ""
                }
              />

              {errors.description && (
                <span className={styles.errorText}>
                  {errors.description}
                </span>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading
                ? "Submitting..."
                : "Submit Ticket"}
            </button>

          </form>
        </main>
      </div>
    </div>
  );
}

export default RaiseTicket;