export default function StatCard({ label, amount, type }) {
  const colorMap = {
    income: "var(--accent-green)",
    expense: "var(--accent-red)",
    balance: "var(--accent-blue)",
  };

  const bgMap = {
    income: "rgba(61, 220, 112, 0.06)",
    expense: "rgba(255, 87, 87, 0.06)",
    balance: "rgba(77, 166, 255, 0.06)",
  };

  const color = colorMap[type] || "var(--text-primary)";
  const bg = bgMap[type] || "transparent";

  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));

  return (
    <div
      className="card"
      style={{ background: bg, borderColor: color + "22" }}
    >
      <p
        style={{
          fontSize: "0.75rem",
          fontWeight: "500",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "0.6rem",
        }}
      >
        {label}
      </p>
      <p
        className="mono"
        style={{
          fontSize: "1.7rem",
          fontWeight: "700",
          color: color,
          lineHeight: 1,
        }}
      >
        {type === "balance" && amount < 0 ? "−" : ""}
        {formatted}
      </p>
    </div>
  );
}
