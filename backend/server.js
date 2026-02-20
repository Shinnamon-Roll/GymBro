require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("./db");
const { Customers, Trainers, GymEquipments, TrainingSessions } = sequelize;

const app = express();
// CORS for Cloudflare Frontend
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "https://gymbro-co9.pages.dev";
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);
app.options("*", cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());

// Sync database
sequelize.sync();

app.get("/api/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Customers API
app.get("/api/customers", async (req, res) => {
  try {
    const rows = await Customers.findAll({ order: [["id", "ASC"]] });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/customers/:id", async (req, res) => {
  try {
    const row = await Customers.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "not_found" });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/customers", async (req, res) => {
  try {
    const created = await Customers.create(req.body);
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/customers/:id", async (req, res) => {
  try {
    const row = await Customers.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "not_found" });
    await row.update(req.body);
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/customers/:id", async (req, res) => {
  try {
    const row = await Customers.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "not_found" });
    await row.destroy();
    res.json({ id: parseInt(req.params.id, 10) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Trainers API
app.get("/api/trainers", async (req, res) => {
  try {
    const rows = await Trainers.findAll({ order: [["id", "ASC"]] });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/trainers", async (req, res) => {
  try {
    const created = await Trainers.create(req.body);
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/trainers/:id", async (req, res) => {
  try {
    const row = await Trainers.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "not_found" });
    await row.update(req.body);
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/trainers/:id", async (req, res) => {
  try {
    const row = await Trainers.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "not_found" });
    await row.destroy();
    res.json({ id: parseInt(req.params.id, 10) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Equipments API
app.get("/api/equipments", async (req, res) => {
  try {
    const rows = await GymEquipments.findAll({ order: [["id", "ASC"]] });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/equipments", async (req, res) => {
  try {
    const created = await GymEquipments.create(req.body);
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/equipments/:id", async (req, res) => {
  try {
    const row = await GymEquipments.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "not_found" });
    await row.update(req.body);
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/equipments/:id", async (req, res) => {
  try {
    const row = await GymEquipments.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "not_found" });
    await row.destroy();
    res.json({ id: parseInt(req.params.id, 10) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Sessions API
app.get("/api/sessions", async (req, res) => {
  const today = req.query.today === "true";
  try {
    const opts = {
      include: [
        { model: Customers, as: "customer" },
        { model: Trainers, as: "trainer" },
        { model: GymEquipments, as: "equipment" },
      ],
      order: [["sessionDate", "DESC"]],
    };
    if (today) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      opts.where = {
        sessionDate: {
          [Sequelize.Op.between]: [start, end],
        },
      };
    }
    const rows = await TrainingSessions.findAll(opts);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/sessions", async (req, res) => {
  try {
    const created = await TrainingSessions.create(req.body);
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/sessions/:id", async (req, res) => {
  try {
    const row = await TrainingSessions.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "not_found" });
    await row.destroy();
    res.json({ id: parseInt(req.params.id, 10) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Summary API
app.get("/api/summary", async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const [c, t, e, s] = await Promise.all([
      Customers.count(),
      Trainers.count(),
      GymEquipments.count(),
      TrainingSessions.count({
        where: {
          sessionDate: {
            [Sequelize.Op.between]: [start, end],
          },
        },
      }),
    ]);
    res.json({
      customers: c,
      trainers: t,
      equipments: e,
      sessions_today: s,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const portEnv = process.env.BACKEND_PORT || process.env.PORT;
const port = portEnv ? parseInt(portEnv, 10) : 3000;

app.listen(port, () => {
  console.log(`Gymbro backend running on ${port}`);
});
