require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("./db");
const { Customers, Trainers, GymEquipments, TrainingSessions } = sequelize;
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const LOGS_FILE = path.join(__dirname, 'logs.json');

// Helper function to log actions
async function logAction(action, details) {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, action, details };
    
    let logs = [];
    try {
      const data = await fsPromises.readFile(LOGS_FILE, 'utf8');
      logs = JSON.parse(data || '[]');
    } catch (readErr) {
      // If file doesn't exist or is empty, start with empty array
      logs = [];
    }
    
    logs.unshift(logEntry); // Add new log to the beginning
    // Optional: Limit logs to prevent file from growing indefinitely (e.g., last 1000 logs)
    if (logs.length > 1000) logs = logs.slice(0, 1000);
    
    await fsPromises.writeFile(LOGS_FILE, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error('Failed to write log:', err);
  }
}

// Helper function to reorder IDs
async function reorderIds(model) {
  try {
    const items = await model.findAll({ order: [['id', 'ASC']] });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const newId = i + 1;
      if (item.id !== newId) {
        const oldId = item.id;
        
        // Manual Cascade Update for TrainingSessions references
        if (model === Customers) {
          await TrainingSessions.update({ customerId: newId }, { where: { customerId: oldId } });
        } else if (model === Trainers) {
          await TrainingSessions.update({ trainerId: newId }, { where: { trainerId: oldId } });
        } else if (model === GymEquipments) {
          await TrainingSessions.update({ equipmentId: newId }, { where: { equipmentId: oldId } });
        }
        
        // Update the item's ID using raw query
        const tableName = model.tableName;
        await sequelize.query(`UPDATE "${tableName}" SET id = ${newId} WHERE id = ${oldId}`);
      }
    }
    
    // Reset sequence
    const tableName = model.tableName;
    const seqName = `"${tableName}_id_seq"`;
    
    if (items.length > 0) {
       await sequelize.query(`SELECT setval('${seqName}', ${items.length})`);
    } else {
       await sequelize.query(`SELECT setval('${seqName}', 1, false)`);
    }
    
  } catch (err) {
    console.error('Failed to reorder IDs:', err);
  }
}

const app = express();
// Allow CORS for local frontend
app.use(
  cors({
    origin: "http://localhost:5500",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);
app.options("*", cors({ origin: "http://localhost:5500" }));
app.use(express.json());

// Login API
app.post("/api/login", async (req, res) => {
  const { email, phone } = req.body;
  
  // Hardcoded Admin Check
  if ((email === "admin@gymbro.com" && phone === "123456")) {
    return res.json({
      role: "admin",
      user: {
        id: 0,
        fullName: "Admin User",
        email: email,
        memberType: "Admin",
        memberLevel: "Master"
      }
    });
  }

  try {
    const user = await Customers.findOne({ where: { email, phone } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json({
      role: "user",
      user: user
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

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

// Logs API
app.get("/api/logs", async (req, res) => {
  try {
    try {
      const data = await fsPromises.readFile(LOGS_FILE, 'utf8');
      const logs = JSON.parse(data || '[]');
      res.json(logs);
    } catch (readErr) {
      // If file doesn't exist, return empty array
      res.json([]);
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;
    
    // Check if email already exists
    const existing = await Customers.findOne({ where: { email } });
    if (existing) {
        return res.status(400).json({ error: "Email already registered" });
    }

    // Fixed default values as per requirement
    const memberType = "Member";
    const memberLevel = "Beginner"; // Fixed value
    const memberStartDate = new Date();
    // Default 1 year membership
    const memberEndDate = new Date();
    memberEndDate.setFullYear(memberEndDate.getFullYear() + 1);

    const created = await Customers.create({
        fullName,
        email,
        phone,
        memberType,
        memberLevel,
        memberStartDate,
        memberEndDate
    });

    logAction("Register User", `New user registered: ${created.fullName} (${created.email})`);
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: e.message });
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
    logAction("Create Customer", `Created customer: ${created.fullName} (ID: ${created.id})`);
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/customers/:id", async (req, res) => {
  try {
    const row = await Customers.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "not_found" });
    const oldName = row.fullName;
    await row.update(req.body);
    logAction("Update Customer", `Updated customer ID: ${row.id} (Old Name: ${oldName}, New Name: ${row.fullName})`);
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/customers/:id", async (req, res) => {
  try {
    const row = await Customers.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "not_found" });
    const name = row.fullName;
    await row.destroy();
    await reorderIds(Customers);
    logAction("Delete Customer", `Deleted customer: ${name} (ID: ${req.params.id})`);
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
    logAction("Create Trainer", `Created trainer: ${created.trainerName} (ID: ${created.id})`);
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/trainers/:id", async (req, res) => {
  try {
    const row = await Trainers.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "not_found" });
    const oldName = row.trainerName;
    await row.update(req.body);
    logAction("Update Trainer", `Updated trainer ID: ${row.id} (Old Name: ${oldName}, New Name: ${row.trainerName})`);
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/trainers/:id", async (req, res) => {
  try {
    const row = await Trainers.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "not_found" });
    const name = row.trainerName;
    await row.destroy();
    await reorderIds(Trainers);
    logAction("Delete Trainer", `Deleted trainer: ${name} (ID: ${req.params.id})`);
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
    logAction("Create Equipment", `Created equipment: ${created.equipmentName} (ID: ${created.id})`);
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/equipments/:id", async (req, res) => {
  try {
    const row = await GymEquipments.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "not_found" });
    const oldName = row.equipmentName;
    await row.update(req.body);
    logAction("Update Equipment", `Updated equipment ID: ${row.id} (Old Name: ${oldName}, New Name: ${row.equipmentName})`);
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/equipments/:id", async (req, res) => {
  try {
    const row = await GymEquipments.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "not_found" });
    const name = row.equipmentName;
    await row.destroy();
    await reorderIds(GymEquipments);
    logAction("Delete Equipment", `Deleted equipment: ${name} (ID: ${req.params.id})`);
    res.json({ id: parseInt(req.params.id, 10) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Sessions API
app.get("/api/sessions", async (req, res) => {
  const today = req.query.today === "true";
  const all = req.query.all === "true";
  const dateStr = req.query.date;

  try {
    const opts = {
      include: [
        { model: Customers, as: "customer" },
        { model: Trainers, as: "trainer" },
        { model: GymEquipments, as: "equipment" },
      ],
      order: [["sessionDate", "DESC"]],
    };

    if (all) {
      // No filter
    } else if (dateStr) {
      const start = new Date(dateStr);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(dateStr);
      end.setUTCHours(23, 59, 59, 999);
      opts.where = {
        sessionDate: {
          [Sequelize.Op.between]: [start, end],
        },
      };
    } else if (today) {
      const start = new Date();
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date();
      end.setUTCHours(23, 59, 59, 999);
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
    const { sessionDate, duration, trainerId, equipmentId, customerId } = req.body;
    
    // Calculate endDate
    const start = new Date(sessionDate);
    let end;
    if (req.body.endDate) {
        end = new Date(req.body.endDate);
    } else {
        // Default 1 hour if not specified, or use duration (minutes)
        const dur = duration ? parseInt(duration) : 60;
        // Fix: Ensure we are using the timestamp value for calculation to avoid timezone shifts during setHours/etc
        end = new Date(start.getTime() + dur * 60000);
    }
    
    // Check equipment status
    if (equipmentId) {
      const equipment = await GymEquipments.findByPk(equipmentId);
      if (equipment && equipment.status === 'Maintenance') {
        return res.status(400).json({ error: "This equipment is currently in maintenance and cannot be booked." });
      }
    }

    // Check availability (Trainer)
    // Overlap: (StartA < EndB) and (EndA > StartB)
    if (trainerId) {
        const trainerConflict = await TrainingSessions.findOne({
            where: {
                trainerId,
                [Sequelize.Op.and]: [
                    { sessionDate: { [Sequelize.Op.lt]: end } },
                    { endDate: { [Sequelize.Op.gt]: start } }
                ]
            }
        });
        
        if (trainerConflict) {
            return res.status(400).json({ error: "Trainer is not available at this time." });
        }
    }

    // Check availability (Equipment)
    const equipmentConflict = await TrainingSessions.findOne({
        where: {
            equipmentId,
            [Sequelize.Op.and]: [
                { sessionDate: { [Sequelize.Op.lt]: end } },
                { endDate: { [Sequelize.Op.gt]: start } }
            ]
        }
    });

    if (equipmentConflict) {
        return res.status(400).json({ error: "Equipment is already booked at this time." });
    }

    const created = await TrainingSessions.create({
        sessionDate: start,
        endDate: end,
        customerId,
        trainerId,
        equipmentId
    });
    logAction("Create Session", `Created session ID: ${created.id} (Customer: ${created.customerId}, Trainer: ${created.trainerId})`);
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
    await reorderIds(TrainingSessions);
    logAction("Delete Session", `Deleted session ID: ${req.params.id}`);
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

// Auto Delete Expired Users
async function checkExpiredMembers() {
    try {
        const now = new Date();
        const expired = await Customers.findAll({
            where: {
                memberEndDate: {
                    [Sequelize.Op.lt]: now
                }
            }
        });
        
        if (expired.length > 0) {
            console.log(`Checking Expired: Found ${expired.length} users. Deleting...`);
            for (const user of expired) {
                // Delete sessions first (manual cascade)
                await TrainingSessions.destroy({ where: { customerId: user.id } });
                // Delete user
                await user.destroy();
                logAction("Auto Delete Expired", `Deleted user ID: ${user.id} (${user.fullName})`);
            }
            // Reorder
            await reorderIds(Customers);
            console.log("Expired users cleanup complete.");
        } else {
            console.log("Checking Expired: No expired users found.");
        }
    } catch (err) {
        console.error("Error in checkExpiredMembers:", err);
    }
}

// Run on start
checkExpiredMembers();
// And every 24 hours
setInterval(checkExpiredMembers, 24 * 60 * 60 * 1000);

// Reports API
app.get("/api/reports/customers", async (req, res) => {
    try {
        const data = await Customers.findAll();
        const report = {
            timestamp: new Date(),
            count: data.length,
            data
        };
        res.json(report);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/api/reports/trainers", async (req, res) => {
    try {
        const data = await Trainers.findAll();
        const report = {
            timestamp: new Date(),
            count: data.length,
            data
        };
        res.json(report);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(port, () => {
  console.log(`Gymbro backend running on ${port}`);
});
