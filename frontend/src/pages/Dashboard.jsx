import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { transactionAPI } from "../utils/api.js";
import StatCard from "../components/StatCard.jsx";
import TransactionForm from "../components/TransactionForm.jsx";

export default function Dashboard() {
  const { token, user } = useAuth();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [summary, setSummary] = useState({ total_income: 0, total_expenses: 0, balance: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const [summaryData, transactionsData] = await Promise.all([
        transactionAPI.getSummary(token, currentMonth, currentYear),
        transactionAPI.getAll(token, {}),
      ]);

      setSummary(summaryData);
      setRecent(transactionsData.slice(0, 5)); // show only 5 most recent
    } catch (err) {
      console.error("Dashboard load error:", err.message);
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // Get month name
  const monthName = now.toLocaleString("default", { month: "long" });

  return (
    <div className="page-enter" style={{ padding: "2rem", maxWidth: "1200px" }}>
      {/* Page header */}
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.3rem" }}>
          {monthName} {currentYear}
        </p>
        <h1
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "1.6rem",
            fontWeight: "700",
            color: "var(--text-primary)",
          }}
        >
          Hello, {user?.name?.split(" ")[0]} 👋
        </h1>
      </div>

      {loading ? (
        <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "3rem" }}>
          Loading...
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>
          {/* LEFT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
              <StatCard label="Total Income" amount={summary.total_income} type="income" />
              <StatCard label="Total Expenses" amount={summary.total_expenses} type="expense" />
              <StatCard label="Balance" amount={summary.balance} type="balance" />
            </div>

            {/* Recent transactions */}
            <div className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.25rem",
                }}
              >
                <h2 style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text-primary)" }}>
                  Recent Transactions
                </h2>
                <a
                  href="/transactions"
                  style={{ fontSize: "0.8rem", color: "var(--accent-green)", textDecoration: "none" }}
                >
                  View all →
                </a>
              </div>

              {recent.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "2.5rem",
                    color: "var(--text-muted)",
                    fontSize: "0.88rem",
                  }}
                >
                  No transactions yet. Add one to get started!
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  {recent.map((tx) => (
                    <TransactionRow key={tx.id} tx={tx} formatCurrency={formatCurrency} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Add transaction form */}
          <TransactionForm onSuccess={loadDashboard} />
        </div>
      )}
    </div>
  );
}

// Small component for a single transaction row
function TransactionRow({ tx, formatCurrency }) {
  const isExpense = tx.type === "expense";
  const date = new Date(tx.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.75rem 0.5rem",
        borderBottom: "1px solid var(--border)",
        transition: "background 0.15s ease",
        borderRadius: "6px",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Color dot */}
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: isExpense ? "var(--accent-red)" : "var(--accent-green)",
            flexShrink: 0,
          }}
        />
        <div>
          <p style={{ fontSize: "0.88rem", fontWeight: "500", color: "var(--text-primary)" }}>
            {tx.category}
          </p>
          {tx.description && (
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{tx.description}</p>
          )}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <p
          className="mono"
          style={{
            fontSize: "0.9rem",
            fontWeight: "600",
            color: isExpense ? "var(--accent-red)" : "var(--accent-green)",
          }}
        >
          {isExpense ? "−" : "+"}{formatCurrency(tx.amount)}
        </p>
        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{date}</p>
      </div>
    </div>
  );
}
