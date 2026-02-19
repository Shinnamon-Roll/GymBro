const express = require("express");
const cors = require("cors");
const { QueryTypes } = require("sequelize");
const sequelize = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const runQuery = async (text, params, kind) => {
  if (kind === "select") {
    const rows = await sequelize.query(text, {
      replacements: params,
      type: QueryTypes.SELECT,
    });
    return { rows };
  }
  const [rows] = await sequelize.query(text, {
    replacements: params,
  });
  return { rows: rows || [] };
};

app.get("/api/health", async (req, res) => {
  try {
    await runQuery("SELECT 1", [], "select");
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
});

app.get("/api/customers", async (req, res) => {
  try {
    const r = await runQuery("SELECT * FROM customers ORDER BY id", [], "select");
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.get("/api/customers/:id", async (req, res) => {
  try {
    const r = await runQuery("SELECT * FROM customers WHERE id = ?", [req.params.id], "select");
    if (!r.rows[0]) return res.status(404).json({ error: "not_found" });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.post("/api/customers", async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email) return res.status(400).json({ error: "invalid" });
  try {
    const r = await runQuery(
      "INSERT INTO customers(name,email,phone) VALUES(?,?,?) RETURNING *",
      [name, email, phone || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.put("/api/customers/:id", async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    const r = await runQuery(
      "UPDATE customers SET name = ?, email = ?, phone = ? WHERE id = ? RETURNING *",
      [name, email, phone || null, req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: "not_found" });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.delete("/api/customers/:id", async (req, res) => {
  try {
    const r = await runQuery("DELETE FROM customers WHERE id = ? RETURNING id", [
      req.params.id,
    ]);
    if (!r.rows[0]) return res.status(404).json({ error: "not_found" });
    res.json({ id: r.rows[0].id });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.get("/api/trainers", async (req, res) => {
  try {
    const r = await runQuery("SELECT * FROM trainers ORDER BY id", [], "select");
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.post("/api/trainers", async (req, res) => {
  const { name, specialty } = req.body;
  if (!name) return res.status(400).json({ error: "invalid" });
  try {
    const r = await runQuery(
      "INSERT INTO trainers(name,specialty) VALUES(?,?) RETURNING *",
      [name, specialty || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.put("/api/trainers/:id", async (req, res) => {
  const { name, specialty } = req.body;
  try {
    const r = await runQuery(
      "UPDATE trainers SET name = ?, specialty = ? WHERE id = ? RETURNING *",
      [name, specialty || null, req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: "not_found" });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.delete("/api/trainers/:id", async (req, res) => {
  try {
    const r = await runQuery("DELETE FROM trainers WHERE id = ? RETURNING id", [
      req.params.id,
    ]);
    if (!r.rows[0]) return res.status(404).json({ error: "not_found" });
    res.json({ id: r.rows[0].id });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.get("/api/equipments", async (req, res) => {
  try {
    const r = await runQuery(
      "SELECT * FROM gym_equipments ORDER BY id",
      [],
      "select"
    );
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.post("/api/equipments", async (req, res) => {
  const { name, status } = req.body;
  if (!name) return res.status(400).json({ error: "invalid" });
  const st = status && ["Available", "Maintenance"].includes(status) ? status : "Available";
  try {
    const r = await runQuery(
      "INSERT INTO gym_equipments(name,status) VALUES(?,?) RETURNING *",
      [name, st]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.put("/api/equipments/:id", async (req, res) => {
  const { name, status } = req.body;
  const st = status && ["Available", "Maintenance"].includes(status) ? status : null;
  try {
    const r = await runQuery(
      "UPDATE gym_equipments SET name = COALESCE(?,name), status = COALESCE(?,status) WHERE id = ? RETURNING *",
      [name || null, st, req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: "not_found" });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.delete("/api/equipments/:id", async (req, res) => {
  try {
    const r = await runQuery(
      "DELETE FROM gym_equipments WHERE id = ? RETURNING id",
      [req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: "not_found" });
    res.json({ id: r.rows[0].id });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.get("/api/sessions", async (req, res) => {
  const today = req.query.today === "true";
  const base =
    "SELECT ts.id, ts.customer_id, c.name AS customer_name, ts.trainer_id, t.name AS trainer_name, ts.equipment_id, e.name AS equipment_name, ts.scheduled_at FROM training_sessions ts JOIN customers c ON c.id=ts.customer_id JOIN trainers t ON t.id=ts.trainer_id JOIN gym_equipments e ON e.id=ts.equipment_id";
  const where = today ? " WHERE date_trunc('day', ts.scheduled_at)=date_trunc('day', now())" : "";
  try {
    const r = await runQuery(
      base + where + " ORDER BY ts.scheduled_at DESC",
      [],
      "select"
    );
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.post("/api/sessions", async (req, res) => {
  const { customer_id, trainer_id, equipment_id, scheduled_at } = req.body;
  if (!customer_id || !trainer_id || !equipment_id || !scheduled_at)
    return res.status(400).json({ error: "invalid" });
  try {
    const r = await runQuery(
      "INSERT INTO training_sessions(customer_id,trainer_id,equipment_id,scheduled_at) VALUES(?,?,?,?) RETURNING *",
      [customer_id, trainer_id, equipment_id, scheduled_at]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.delete("/api/sessions/:id", async (req, res) => {
  try {
    const r = await runQuery(
      "DELETE FROM training_sessions WHERE id = ? RETURNING id",
      [req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: "not_found" });
    res.json({ id: r.rows[0].id });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.get("/api/summary", async (req, res) => {
  try {
    const [c, t, e, s] = await Promise.all([
      runQuery("SELECT COUNT(*)::int AS count FROM customers", [], "select"),
      runQuery("SELECT COUNT(*)::int AS count FROM trainers", [], "select"),
      runQuery("SELECT COUNT(*)::int AS count FROM gym_equipments", [], "select"),
      runQuery(
        "SELECT COUNT(*)::int AS count FROM training_sessions WHERE date_trunc('day', scheduled_at)=date_trunc('day', now())",
        [],
        "select"
      ),
    ]);
    res.json({
      customers: c.rows[0].count,
      trainers: t.rows[0].count,
      equipments: e.rows[0].count,
      sessions_today: s.rows[0].count,
    });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

const portEnv = process.env.BACKEND_PORT || process.env.PORT;
const port = portEnv ? parseInt(portEnv, 10) : 3000;
app.listen(port, () => {
  console.log(`Gymbro backend running on ${port}`);
});
