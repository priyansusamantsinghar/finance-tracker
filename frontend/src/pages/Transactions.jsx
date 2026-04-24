import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { transactionAPI } from "../utils/api.js";
import TransactionForm from "../components/TransactionForm.jsx";

export default function Transactions() {
  const { token } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({ type: "", category: "", search: "" });

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  async function loadTransactions() {
    setLoading(true);
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== "")
      );
      const data = await transactionAPI.getAll(token, activeFilters);
      setTransactions(data);
    } catch (err) {
      console.error("Load transactions error:", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await transactionAPI.delete(token, id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
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

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function groupByDate(txList) {
    const groups = {};
    txList.forEach((tx) => {
      const key = tx.date;
      if (!groups[key]) groups[key] = [];
      groups[key].push(tx);
    });
    return Object.entries(groups).sort(([a], [b]) => new Date(b) - new Date(a));
  }

  const grouped = groupByDate(transactions);

  return (
    <div className="page-enter" style={{ padding: "2rem", maxWidth: "1200px" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "'Space Mono', monospace", fontSize: "1.6rem", fontWeight: "700", color: "var(--text-primary)" }}>
          Transactions
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "0.25rem" }}>
          {transactions.length} record{transactions.length !== 1 ? "s" : ""} found
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>
        {/* LEFT: Filters + list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Filter bar */}
          <div
            className="card"
            style={{ padding: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
          >
            {/* Search */}
            <input
              className="input"
              style={{ flex: "2", minWidth: "160px" }}
              type="text"
              placeholder="Search description..."
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            />

            {/* Type filter */}
            <select
              className="input"
              style={{ flex: "1", minWidth: "130px" }}
              value={filters.type}
              onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            {/* Clear button */}
            {(filters.type || filters.search) && (
              <button
                className="btn-ghost"
                style={{ fontSize: "0.82rem", padding: "0.5rem 0.9rem" }}
                onClick={() => setFilters({ type: "", category: "", search: "" })}
              >
                Clear
              </button>
            )}
          </div>

          {/* Transaction list */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {loading ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                Loading...
              </div>
            ) : transactions.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                No transactions found
              </div>
            ) : (
              grouped.map(([date, txList]) => (
                <div key={date}>
                  {/* Date header */}
                  <div
                    style={{
                      padding: "0.6rem 1.25rem",
                      background: "var(--bg-surface)",
                      borderBottom: "1px solid var(--border)",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                    }}
                  >
                    {formatDate(date)}
                  </div>

                  {/* Transactions in this date */}
                  {txList.map((tx, index) => (
                    <div
                      key={tx.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.9rem 1.25rem",
                        borderBottom: index < txList.length - 1 ? "1px solid var(--border)" : "none",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {/* Type icon */}
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "9px",
                            background:
                              tx.type === "expense"
                                ? "rgba(255,87,87,0.1)"
                                : "rgba(61,220,112,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1rem",
                            flexShrink: 0,
                          }}
                        >
                          {tx.type === "expense" ? "−" : "+"}
                        </div>
                        <div>
                          <p style={{ fontSize: "0.9rem", fontWeight: "500", color: "var(--text-primary)" }}>
                            {tx.category}
                          </p>
                          {tx.description && (
                            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "1px" }}>
                              {tx.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <span
                          className="mono"
                          style={{
                            fontSize: "0.95rem",
                            fontWeight: "600",
                            color: tx.type === "expense" ? "var(--accent-red)" : "var(--accent-green)",
                          }}
                        >
                          {tx.type === "expense" ? "−" : "+"}{formatCurrency(tx.amount)}
                        </span>
                        <button
                          className="btn-danger"
                          onClick={() => handleDelete(tx.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Add form */}
        <TransactionForm onSuccess={loadTransactions} />
      </div>
    </div>
  );
}
