import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { transactionAPI } from "../utils/api.js";

const EXPENSE_CATEGORIES = [
  "Food & Groceries",
  "Dining Out",
  "Transport",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Healthcare",
  "Education",
  "Rent",
  "Other",
];

const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business",
  "Bonus",
  "Investment",
  "Gift",
  "Other",
];

export default function TransactionForm({ onSuccess }) {
  const { token } = useAuth();

  const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    category: "",
    description: "",
    date: today,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // Reset category when type changes
      ...(name === "type" ? { category: "" } : {}),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.category) {
      setError("Please select a category");
      return;
    }

    setLoading(true);
    try {
      await transactionAPI.add(token, form);
      // Reset form after successful submission
      setForm({ type: "expense", amount: "", category: "", description: "", date: today });
      onSuccess(); // notify parent to refresh data
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const categories = form.type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="card">
      <h2
        style={{
          fontSize: "0.95rem",
          fontWeight: "600",
          color: "var(--text-primary)",
          marginBottom: "1.25rem",
        }}
      >
        Add Transaction
      </h2>

      {error && <div className="error-msg" style={{ marginBottom: "1rem" }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
        {/* Type toggle */}
        <div>
          <label className="label">Type</label>
          <div style={{ display: "flex", gap: "8px" }}>
            {["expense", "income"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, type: t, category: "" }))}
                style={{
                  flex: 1,
                  padding: "0.55rem",
                  borderRadius: "9px",
                  border: "1px solid",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: "500",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.15s ease",
                  borderColor:
                    form.type === t
                      ? t === "expense"
                        ? "var(--accent-red)"
                        : "var(--accent-green)"
                      : "var(--border)",
                  background:
                    form.type === t
                      ? t === "expense"
                        ? "rgba(255,87,87,0.1)"
                        : "rgba(61,220,112,0.1)"
                      : "transparent",
                  color:
                    form.type === t
                      ? t === "expense"
                        ? "var(--accent-red)"
                        : "var(--accent-green)"
                      : "var(--text-muted)",
                }}
              >
                {t === "expense" ? "− Expense" : "+ Income"}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div className="form-group">
          <label className="label">Amount (₹)</label>
          <input
            className="input mono"
            type="number"
            name="amount"
            placeholder="0"
            min="1"
            step="0.01"
            value={form.amount}
            onChange={handleChange}
            required
          />
        </div>

        {/* Category */}
        <div className="form-group">
          <label className="label">Category</label>
          <select
            className="input"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">Select category...</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div className="form-group">
          <label className="label">Date</label>
          <input
            className="input"
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description (optional) */}
        <div className="form-group">
          <label className="label">Description <span style={{ color: "var(--text-muted)" }}>(optional)</span></label>
          <input
            className="input"
            type="text"
            name="description"
            placeholder="e.g. Monthly groceries..."
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
          style={{ width: "100%", marginTop: "0.25rem" }}
        >
          {loading ? "Adding..." : "Add Transaction"}
        </button>
      </form>
    </div>
  );
}
