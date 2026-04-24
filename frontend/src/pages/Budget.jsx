// pages/Budget.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { budgetAPI } from "../utils/api.js";

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

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Budget() {
  const { token } = useAuth();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form for adding/editing a budget
  const [form, setForm] = useState({ category: "", amount: "" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadBudgets();
  }, [selectedMonth, selectedYear]);

  async function loadBudgets() {
    setLoading(true);
    try {
      const data = await budgetAPI.getAll(token, selectedMonth, selectedYear);
      setBudgets(data);
    } catch (err) {
      console.error("Load budgets error:", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveBudget(e) {
    e.preventDefault();
    setFormError("");

    if (!form.category || !form.amount) {
      setFormError("Please fill in all fields");
      return;
    }

    if (form.amount <= 0) {
      setFormError("Amount must be greater than 0");
      return;
    }

    setFormLoading(true);
    try {
      await budgetAPI.save(token, {
        category: form.category,
        amount: parseFloat(form.amount),
        month: selectedMonth,
        year: selectedYear,
      });
      setForm({ category: "", amount: "" });
      loadBudgets(); // refresh list
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this budget?")) return;
    try {
      await budgetAPI.delete(token, id);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert("Could not delete: " + err.message);
    }
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function getProgressColor(pct) {
    if (pct >= 100) return "var(--accent-red)";
    if (pct >= 75) return "var(--accent-yellow)";
    return "var(--accent-green)";
  }

  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  return (
    <div className="page-enter" style={{ padding: "2rem", maxWidth: "1000px" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "'Space Mono', monospace", fontSize: "1.6rem", fontWeight: "700", color: "var(--text-primary)" }}>
          Budget Tracker
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "0.25rem" }}>
          Set and track your monthly spending limits
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem", alignItems: "start" }}>
        {/* LEFT: Budget list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Month/Year picker */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <select
              className="input"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              style={{ flex: 2 }}
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              className="input"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              style={{ flex: 1 }}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Budget cards */}
          {loading ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
              Loading...
            </div>
          ) : budgets.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                No budgets set for {MONTHS[selectedMonth - 1]} {selectedYear}.
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "0.35rem" }}>
                Use the form to add budget limits →
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {budgets.map((budget) => {
                const pct = Math.min(budget.percentage, 100);
                const color = getProgressColor(budget.percentage);
                const isOver = budget.percentage > 100;

                return (
                  <div key={budget.id} className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.9rem" }}>
                      <div>
                        <p style={{ fontWeight: "600", fontSize: "0.95rem", color: "var(--text-primary)" }}>
                          {budget.category}
                        </p>
                        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                          {formatCurrency(budget.spent)} spent of {formatCurrency(budget.budget_amount)}
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span
                          className="mono"
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: "700",
                            color: color,
                          }}
                        >
                          {budget.percentage}%
                        </span>
                        <button className="btn-danger" onClick={() => handleDelete(budget.id)}>
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div
                      style={{
                        height: "6px",
                        background: "var(--bg-surface)",
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: color,
                          borderRadius: "3px",
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>

                    {/* Warning if over budget */}
                    {isOver && (
                      <p style={{ fontSize: "0.75rem", color: "var(--accent-red)", marginTop: "0.5rem" }}>
                        ⚠ Over budget by {formatCurrency(budget.spent - budget.budget_amount)}
                      </p>
                    )}

                    {/* Remaining */}
                    {!isOver && budget.spent > 0 && (
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                        {formatCurrency(budget.budget_amount - budget.spent)} remaining
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Set budget form */}
        <div className="card">
          <h2 style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "1.25rem" }}>
            Set Budget
          </h2>

          {formError && (
            <div className="error-msg" style={{ marginBottom: "1rem" }}>
              {formError}
            </div>
          )}

          <form onSubmit={handleSaveBudget} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            <div className="form-group">
              <label className="label">Category</label>
              <select
                className="input"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                required
              >
                <option value="">Select category...</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="label">Monthly Limit (₹)</label>
              <input
                className="input mono"
                type="number"
                placeholder="e.g. 5000"
                min="1"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                required
              />
            </div>

            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Setting a budget for{" "}
              <strong style={{ color: "var(--text-secondary)" }}>
                {MONTHS[selectedMonth - 1]} {selectedYear}
              </strong>
              . If a budget already exists for this category, it will be updated.
            </p>

            <button
              type="submit"
              className="btn-primary"
              disabled={formLoading}
              style={{ width: "100%" }}
            >
              {formLoading ? "Saving..." : "Save Budget"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
