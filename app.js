const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "database.db");
let db = null;

// Initialize DB
const initDB = async () => {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      company TEXT
    )
  `);
};

initDB();

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) return res.status(401).send("Invalid JWT Token");

  jwt.verify(token, "SECRET_KEY", (err, payload) => {
    if (err) return res.status(401).send("Invalid JWT Token");
    req.user = payload;
    next();
  });
};

// 🔥 Score Logic
const getScore = (user) => {
  let score = 0;
  if (!user.email.includes("gmail")) score += 2;
  if (user.company.length > 10) score += 2;

  if (score >= 3) return "High";
  if (score >= 2) return "Medium";
  return "Low";
};

// ---------------- REGISTER ----------------
app.post("/register", async (req, res) => {
  const { name, email, password, company } = req.body;

  if (!password || password.length < 6)
    return res.status(400).send("Password too short");

  const existing = await db.get(`SELECT * FROM users WHERE email=?`, [email]);
  if (existing) return res.status(400).send("User already exists");

  const hashed = await bcrypt.hash(password, 10);

  await db.run(
    `INSERT INTO users (name,email,password,company) VALUES (?,?,?,?)`,
    [name, email, hashed, company]
  );

  res.send("User created");
});

// ---------------- LOGIN ----------------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await db.get(`SELECT * FROM users WHERE email=?`, [email]);
  if (!user) return res.status(400).send("Invalid user");

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).send("Invalid password");

  const token = jwt.sign({ email }, "SECRET_KEY");

  res.send({ token });
});

// ---------------- GET USERS ----------------
app.get("/users", authenticateToken, async (req, res) => {
  let users = await db.all(`SELECT * FROM users`);

  const { search, sort, order } = req.query;

  if (search) {
    users = users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
  }

  users = users.map((u) => ({ ...u, score: getScore(u) }));

  if (sort) {
    users.sort((a, b) => {
      return order === "desc"
        ? b[sort].localeCompare(a[sort])
        : a[sort].localeCompare(b[sort]);
    });
  }

  res.json({
    success: true,
    count: users.length,
    data: users,
  });
});

// ---------------- GET USER BY ID ----------------
app.get("/users/:id", authenticateToken, async (req, res) => {
  const user = await db.get(`SELECT * FROM users WHERE id=?`, [
    req.params.id,
  ]);

  if (!user) return res.status(404).send("User not found");

  user.score = getScore(user);

  res.json(user);
});

// ---------------- CREATE USER ----------------
app.post("/users", authenticateToken, async (req, res) => {
  const { name, email, company } = req.body;

  await db.run(
    `INSERT INTO users (name,email,company) VALUES (?,?,?)`,
    [name, email, company]
  );

  res.send("User added");
});

// ---------------- UPDATE USER ----------------
app.put("/users/:id", authenticateToken, async (req, res) => {
  const { name, email, company } = req.body;

  await db.run(
    `UPDATE users SET name=?, email=?, company=? WHERE id=?`,
    [name, email, company, req.params.id]
  );

  res.send("User updated");
});

// ---------------- DELETE USER ----------------
app.delete("/users/:id", authenticateToken, async (req, res) => {
  await db.run(`DELETE FROM users WHERE id=?`, [req.params.id]);
  res.send("User deleted");
});

module.exports = app;