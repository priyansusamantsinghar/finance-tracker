import pool from "../db/index.js";

export async function getBudgets(req, res) {
  const userId = req.user.id;
  const { month, year } = req.query;

  const now = new Date();
  const targetMonth = month || now.getMonth() + 1;
  const targetYear = year || now.getFullYear();

  try {
    const result = await pool.query(
      `SELECT
        b.id,
        b.category,
        b.amount AS budget_amount,
        b.month,
        b.year,
        COALESCE(
          (SELECT SUM(t.amount)
           FROM transactions t
           WHERE t.user_id = b.user_id
             AND t.category = b.category
             AND t.type = 'expense'
             AND EXTRACT(MONTH FROM t.date) = b.month
             AND EXTRACT(YEAR FROM t.date) = b.year),
          0
        ) AS spent
       FROM budgets b
       WHERE b.user_id = $1 AND b.month = $2 AND b.year = $3
       ORDER BY b.category`,
      [userId, targetMonth, targetYear]
    );

    const budgets = result.rows.map((b) => ({
      ...b,
      budget_amount: parseFloat(b.budget_amount),
      spent: parseFloat(b.spent),
      percentage: b.budget_amount > 0 ? Math.round((b.spent / b.budget_amount) * 100) : 0,
    }));

    res.json(budgets);
  } catch (err) {
    console.error("Get budgets error:", err.message);
    res.status(500).json({ error: "Could not fetch budgets" });
  }
}

export async function upsertBudget(req, res) {
  const userId = req.user.id;
  const { category, amount, month, year } = req.body;

  if (!category || !amount || !month || !year) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO budgets (user_id, category, amount, month, year)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, category, month, year)
       DO UPDATE SET amount = EXCLUDED.amount
       RETURNING *`,
      [userId, category, amount, month, year]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Upsert budget error:", err.message);
    res.status(500).json({ error: "Could not save budget" });
  }
}

export async function deleteBudget(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Budget not found" });
    }

    res.json({ message: "Budget deleted", id: parseInt(id) });
  } catch (err) {
    console.error("Delete budget error:", err.message);
    res.status(500).json({ error: "Could not delete budget" });
  }
}
