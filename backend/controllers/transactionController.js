import pool from "../db/index.js";

export async function getTransactions(req, res) {
  const userId = req.user.id;

  const { type, category, search } = req.query;

  let query = "SELECT * FROM transactions WHERE user_id = $1";
  let params = [userId];
  let paramCount = 1;
  if (type) {
    paramCount++;
    query += ` AND type = $${paramCount}`;
    params.push(type);
  }

  if (category) {
    paramCount++;
    query += ` AND category = $${paramCount}`;
    params.push(category);
  }

  if (search) {
    paramCount++;
    query += ` AND description ILIKE $${paramCount}`;
    params.push(`%${search}%`);
  }

  query += " ORDER BY date DESC, created_at DESC";

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Get transactions error:", err.message);
    res.status(500).json({ error: "Could not fetch transactions" });
  }
}

export async function addTransaction(req, res) {
  const userId = req.user.id;
  const { type, amount, category, description, date } = req.body;
  if (!type || !amount || !category || !date) {
    return res.status(400).json({ error: "Type, amount, category, and date are required" });
  }

  if (amount <= 0) {
    return res.status(400).json({ error: "Amount must be greater than 0" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO transactions (user_id, type, amount, category, description, date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, type, amount, category, description || "", date]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Add transaction error:", err.message);
    res.status(500).json({ error: "Could not add transaction" });
  }
}

export async function deleteTransaction(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted", id: parseInt(id) });
  } catch (err) {
    console.error("Delete transaction error:", err.message);
    res.status(500).json({ error: "Could not delete transaction" });
  }
}

export async function getSummary(req, res) {
  const userId = req.user.id;
  const { month, year } = req.query;

  try {
    let dateFilter = "";
    let params = [userId];

    if (month && year) {
      dateFilter = " AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date) = $3";
      params.push(month, year);
    }

    const result = await pool.query(
      `SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses
       FROM transactions
       WHERE user_id = $1 ${dateFilter}`,
      params
    );

    const { total_income, total_expenses } = result.rows[0];
    const balance = total_income - total_expenses;

    res.json({
      total_income: parseFloat(total_income),
      total_expenses: parseFloat(total_expenses),
      balance: parseFloat(balance),
    });
  } catch (err) {
    console.error("Summary error:", err.message);
    res.status(500).json({ error: "Could not get summary" });
  }
}
