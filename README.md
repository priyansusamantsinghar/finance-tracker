# 💰 FinTrack — Personal Finance Tracker

A full-stack personal finance tracker built with React 19, Node.js 24, and PostgreSQL.

---

## 🗂 Project Structure

```
finance-tracker/
├── backend/                 ← Node.js + Express API
│   ├── controllers/         ← Business logic functions
│   ├── db/
│   │   ├── index.js         ← Database connection
│   │   └── schema.sql       ← Run this in pgAdmin4 first!
│   ├── middleware/
│   │   └── auth.js          ← JWT token checker
│   ├── routes/              ← API URL definitions
│   ├── server.js            ← Entry point
│   ├── .env.example         ← Copy to .env and fill in values
│   └── package.json
│
└── frontend/                ← React 19 + Tailwind CSS
    ├── src/
    │   ├── components/      ← Reusable UI pieces
    │   ├── context/         ← Global state (AuthContext)
    │   ├── pages/           ← Full page components
    │   ├── utils/
    │   │   └── api.js       ← All API call functions
    │   ├── App.jsx          ← Routes
    │   ├── main.jsx         ← Entry point
    │   └── index.css        ← Global styles & design tokens
    └── package.json
```

---

## ⚙️ Setup Instructions

### Step 1 — Set up PostgreSQL Database

1. Open **pgAdmin 4**
2. Right-click **Databases** → **Create** → **Database**
3. Name it `finance_tracker` → Save
4. Click the database → **Query Tool**
5. Open `backend/db/schema.sql` and paste + run it
6. You should see 3 tables created: `users`, `transactions`, `budgets`

---

### Step 2 — Set up Backend

```bash
# Navigate to backend folder
cd backend

# Copy example env file
cp .env.example .env
```

Edit `.env` and fill in your PostgreSQL password:
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finance_tracker
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE
JWT_SECRET=any_long_random_string_here
```

```bash
# Install dependencies
npm install

# Start backend server
npm run dev
```

You should see:
```
✅ Connected to PostgreSQL database
🚀 Server running on http://localhost:5000
```

---

### Step 3 — Set up Frontend

```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 📋 API Endpoints Reference

### Auth
| Method | URL | Body | Description |
|--------|-----|------|-------------|
| POST | `/api/auth/register` | `{name, email, password}` | Create account |
| POST | `/api/auth/login` | `{email, password}` | Login |

### Transactions (require `Authorization: Bearer <token>` header)
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/transactions` | Get all transactions |
| GET | `/api/transactions?type=expense` | Filter by type |
| GET | `/api/transactions?search=food` | Search description |
| GET | `/api/transactions/summary?month=4&year=2026` | Monthly summary |
| POST | `/api/transactions` | Add transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |

### Budgets (require token)
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/budgets?month=4&year=2026` | Get budgets with spending |
| POST | `/api/budgets` | Create/update budget |
| DELETE | `/api/budgets/:id` | Delete budget |

---

## 💡 Key Concepts Explained

### Why JWT tokens?
After login, the server gives you a token (like a temporary ID card). You include this token in every request so the server knows who you are — without asking for your password every time.

### Why hash passwords?
We never store plain passwords. `bcrypt` converts "mypassword123" into something like `$2b$10$abc...xyz` which can't be reversed. Even if the database is hacked, passwords are safe.

### Why Context API?
Instead of passing `user` and `token` as props through every component (prop drilling), we put them in a Context so any component can access them directly.

### What is CORS?
Our frontend runs on port 5173, backend on port 5000. Browsers block requests between different ports by default. The `cors` package tells the browser "yes, this frontend is allowed to talk to this backend."

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS + CSS Variables |
| Routing | React Router v6 |
| Backend | Node.js 24 + Express |
| Database | PostgreSQL + pgAdmin4 |
| Auth | JWT + bcrypt |
| DB Driver | node-postgres (pg) |
