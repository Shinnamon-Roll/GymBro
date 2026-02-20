const express = require("express");
const cors = require("cors");
const { QueryTypes, fn, col, where } = require("sequelize");
const sequelize = require("./db");

const app = express();
// CORS for Cloudflare Frontend
// TODO: set FRONTEND_ORIGIN to your Cloudflare Pages URL, e.g. https://your-site.pages.dev
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5500";
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);
app.options("*", cors({ origin: FRONTEND_ORIGIN }));
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
    const rows = await sequelize.Customers.findAll({ order: [["id", "ASC"]] });
    const mapped = rows.map((r) => ({
      id: r.id,
      name: r.fullName,
      email: r.email,
      phone: r.phone,
      memberType: r.memberType,
      memberLevel: r.memberLevel,
      memberStartDate: r.memberStartDate,
      memberEndDate: r.memberEndDate,
    }));
    res.json(mapped);
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.get("/api/customers/:id", async (req, res) => {
  try {
    const r = await sequelize.Customers.findByPk(req.params.id);
    if (!r) return res.status(404).json({ error: "not_found" });
    res.json({
      id: r.id,
      name: r.fullName,
      email: r.email,
      phone: r.phone,
      memberType: r.memberType,
      memberLevel: r.memberLevel,
      memberStartDate: r.memberStartDate,
      memberEndDate: r.memberEndDate,
    });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.post("/api/customers", async (req, res) => {
  const body = req.body || {};
  const fullName = body.fullName || body.name;
  const email = body.email;
  if (!fullName || !email) return res.status(400).json({ error: "invalid" });
  try {
    const created = await sequelize.Customers.create({
      fullName,
      email,
      phone: body.phone || null,
      memberType: body.memberType || "Standard",
      memberLevel: body.memberLevel || "Basic",
      memberStartDate: body.memberStartDate ? new Date(body.memberStartDate) : new Date(),
      memberEndDate: body.memberEndDate ? new Date(body.memberEndDate) : null,
    });
    res.status(201).json({
      id: created.id,
      name: created.fullName,
      email: created.email,
      phone: created.phone,
      memberType: created.memberType,
      memberLevel: created.memberLevel,
      memberStartDate: created.memberStartDate,
      memberEndDate: created.memberEndDate,
    });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.put("/api/customers/:id", async (req, res) => {
  const body = req.body || {};
  try {
    const row = await sequelize.Customers.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "not_found" });
    await row.update({
      fullName: body.fullName || body.name || row.fullName,
      email: body.email || row.email,
      phone: body.phone !== undefined ? body.phone : row.phone,
      memberType: body.memberType || row.memberType,
      memberLevel: body.memberLevel || row.memberLevel,
      memberStartDate: body.memberStartDate ? new Date(body.memberStartDate) : row.memberStartDate,
      memberEndDate: body.memberEndDate ? new Date(body.memberEndDate) : row.memberEndDate,
    });
    res.json({
      id: row.id,
      name: row.fullName,
      email: row.email,
      phone: row.phone,
      memberType: row.memberType,
      memberLevel: row.memberLevel,
      memberStartDate: row.memberStartDate,
      memberEndDate: row.memberEndDate,
    });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.delete("/api/customers/:id", async (req, res) => {
  try {
    const row = await sequelize.Customers.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "not_found" });
    await row.destroy();
    res.json({ id: parseInt(req.params.id, 10) });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.get("/api/trainers", async (req, res) => {
  try {
    const rows = await sequelize.Trainers.findAll({ order: [["id", "ASC"]] });
    const mapped = rows.map((r) => ({
      id: r.id,
      name: r.trainerName,
      specialty: r.specialty,
      trainerLevel: r.trainerLevel,
      phone: r.phone,
    }));
    res.json(mapped);
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.post("/api/trainers", async (req, res) => {
  const body = req.body || {};
  const trainerName = body.trainerName || body.name;
  if (!trainerName) return res.status(400).json({ error: "invalid" });
  try {
    const created = await sequelize.Trainers.create({
      trainerName,
      trainerLevel: body.trainerLevel || "Junior",
      specialty: body.specialty || null,
      phone: body.phone || null,
    });
    res.status(201).json({
      id: created.id,
      name: created.trainerName,
      specialty: created.specialty,
      trainerLevel: created.trainerLevel,
      phone: created.phone,
    });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.put("/api/trainers/:id", async (req, res) => {
  const body = req.body || {};
  try {
    const row = await sequelize.Trainers.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "not_found" });
    await row.update({
      trainerName: body.trainerName || body.name || row.trainerName,
      specialty: body.specialty !== undefined ? body.specialty : row.specialty,
      trainerLevel: body.trainerLevel || row.trainerLevel,
      phone: body.phone !== undefined ? body.phone : row.phone,
    });
    res.json({
      id: row.id,
      name: row.trainerName,
      specialty: row.specialty,
      trainerLevel: row.trainerLevel,
      phone: row.phone,
    });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.delete("/api/trainers/:id", async (req, res) => {
  try {
    const row = await sequelize.Trainers.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "not_found" });
    await row.destroy();
    res.json({ id: parseInt(req.params.id, 10) });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.get("/api/equipments", async (req, res) => {
  try {
    const rows = await sequelize.GymEquipments.findAll({ order: [["id", "ASC"]] });
    const mapped = rows.map((r) => ({
      id: r.id,
      name: r.equipmentName,
      status: r.status,
      category: r.category,
    }));
    res.json(mapped);
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.post("/api/equipments", async (req, res) => {
  const body = req.body || {};
  const equipmentName = body.equipmentName || body.name;
  if (!equipmentName) return res.status(400).json({ error: "invalid" });
  const status = body.status && ["Available", "Maintenance"].includes(body.status) ? body.status : "Available";
  try {
    const created = await sequelize.GymEquipments.create({
      equipmentName,
      category: body.category || null,
      status,
    });
    res.status(201).json({
      id: created.id,
      name: created.equipmentName,
      status: created.status,
      category: created.category,
    });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.put("/api/equipments/:id", async (req, res) => {
  const body = req.body || {};
  const status =
    body.status && ["Available", "Maintenance"].includes(body.status) ? body.status : undefined;
  try {
    const row = await sequelize.GymEquipments.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "not_found" });
    await row.update({
      equipmentName: body.equipmentName || body.name || row.equipmentName,
      status: status !== undefined ? status : row.status,
      category: body.category !== undefined ? body.category : row.category,
    });
    res.json({
      id: row.id,
      name: row.equipmentName,
      status: row.status,
      category: row.category,
    });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.delete("/api/equipments/:id", async (req, res) => {
  try {
    const row = await sequelize.GymEquipments.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "not_found" });
    await row.destroy();
    res.json({ id: parseInt(req.params.id, 10) });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.get("/api/sessions", async (req, res) => {
  const today = req.query.today === "true";
  try {
    const opts = {
      include: [
        { model: sequelize.Customers, as: "customer", attributes: ["fullName"] },
        { model: sequelize.Trainers, as: "trainer", attributes: ["trainerName"] },
        { model: sequelize.GymEquipments, as: "equipment", attributes: ["equipmentName"] },
      ],
      order: [["sessionDate", "DESC"]],
    };
    if (today) {
      opts.where = where(fn("date_trunc", "day", col("sessionDate")), fn("date_trunc", "day", fn("now")));
    }
    const rows = await sequelize.TrainingSessions.findAll(opts);
    const mapped = rows.map((r) => ({
      id: r.id,
      customer_id: r.customerId,
      trainer_id: r.trainerId,
      equipment_id: r.equipmentId,
      customer_name: r.customer?.fullName || "",
      trainer_name: r.trainer?.trainerName || "",
      equipment_name: r.equipment?.equipmentName || "",
      scheduled_at: r.sessionDate,
    }));
    res.json(mapped);
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.post("/api/sessions", async (req, res) => {
  const body = req.body || {};
  const customerId = body.customerId || body.customer_id;
  const trainerId = body.trainerId || body.trainer_id;
  const equipmentId = body.equipmentId || body.equipment_id;
  const sessionDate = body.sessionDate || body.scheduled_at;
  if (!customerId || !trainerId || !equipmentId || !sessionDate)
    return res.status(400).json({ error: "invalid" });
  try {
    const created = await sequelize.TrainingSessions.create({
      customerId,
      trainerId,
      equipmentId,
      sessionDate: new Date(sessionDate),
    });
    res.status(201).json({
      id: created.id,
      customer_id: created.customerId,
      trainer_id: created.trainerId,
      equipment_id: created.equipmentId,
      scheduled_at: created.sessionDate,
    });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.delete("/api/sessions/:id", async (req, res) => {
  try {
    const row = await sequelize.TrainingSessions.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "not_found" });
    await row.destroy();
    res.json({ id: parseInt(req.params.id, 10) });
  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.get("/api/summary", async (req, res) => {
  try {
    const [c, t, e, s] = await Promise.all([
      sequelize.Customers.count(),
      sequelize.Trainers.count(),
      sequelize.GymEquipments.count(),
      sequelize.TrainingSessions.count({
        where: where(fn("date_trunc", "day", col("sessionDate")), fn("date_trunc", "day", fn("now"))),
      }),
    ]);
    res.json({
      customers: c,
      trainers: t,
      equipments: e,
      sessions_today: s,
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

// Optional HTTPS (Mixed Content fix if not using platform SSL)
// TODO: If you want Node to serve HTTPS directly, set HTTPS_KEY and HTTPS_CERT envs to file paths
// and optionally HTTPS_PORT (default 3443). Otherwise, use Ruk-com/Cloudflare SSL at the platform layer.
if (process.env.HTTPS_KEY && process.env.HTTPS_CERT) {
  try {
    const fs = require("fs");
    const https = require("https");
    const key = fs.readFileSync(process.env.HTTPS_KEY);
    const cert = fs.readFileSync(process.env.HTTPS_CERT);
    const httpsPort = process.env.HTTPS_PORT ? parseInt(process.env.HTTPS_PORT, 10) : 3443;
    https.createServer({ key, cert }, app).listen(httpsPort, () => {
      console.log(`Gymbro backend HTTPS running on ${httpsPort}`);
    });
  } catch (e) {
    console.error("Failed to start HTTPS server:", e.message);
  }
}
