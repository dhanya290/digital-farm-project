import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("farm.db");
console.log("Successfully connected to SQLite database (farm.db)");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
  );

  CREATE TABLE IF NOT EXISTS animals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    breed TEXT,
    age INTEGER,
    health_status TEXT
  );

  CREATE TABLE IF NOT EXISTS vaccinations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    animal_id INTEGER,
    vaccine_name TEXT,
    date TEXT,
    next_date TEXT,
    FOREIGN KEY(animal_id) REFERENCES animals(id)
  );

  CREATE TABLE IF NOT EXISTS visitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    purpose TEXT,
    entry_time TEXT,
    exit_time TEXT,
    protective_gear INTEGER
  );

  CREATE TABLE IF NOT EXISTS biosecurity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE,
    sanitation_checked INTEGER,
    vehicle_disinfected INTEGER,
    protective_clothing_checked INTEGER,
    equipment_cleaned INTEGER
  );
`);

// Seed Admin User if not exists
const adminExists = db.prepare("SELECT * FROM users WHERE username = ?").get("admin");
if (!adminExists) {
  db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run("admin", "admin@123", "admin");
  db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run("staff", "staff@123", "staff");
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  
  // Auth
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password) as any;
    if (user) {
      res.json({ id: user.id, username: user.username, role: user.role });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Animals
  app.get("/api/animals", (req, res) => {
    const animals = db.prepare("SELECT * FROM animals").all();
    res.json(animals);
  });

  app.post("/api/animals", (req, res) => {
    const { type, breed, age, health_status } = req.body;
    const result = db.prepare("INSERT INTO animals (type, breed, age, health_status) VALUES (?, ?, ?, ?)").run(type, breed, age, health_status);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/animals/:id", (req, res) => {
    const { type, breed, age, health_status } = req.body;
    db.prepare("UPDATE animals SET type = ?, breed = ?, age = ?, health_status = ? WHERE id = ?").run(type, breed, age, health_status, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/animals/:id", (req, res) => {
    db.prepare("DELETE FROM animals WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vaccinations
  app.get("/api/vaccinations", (req, res) => {
    const vaccinations = db.prepare(`
      SELECT v.*, a.type as animal_type, a.breed as animal_breed 
      FROM vaccinations v 
      JOIN animals a ON v.animal_id = a.id
    `).all();
    res.json(vaccinations);
  });

  app.post("/api/vaccinations", (req, res) => {
    const { animal_id, vaccine_name, date, next_date } = req.body;
    const result = db.prepare("INSERT INTO vaccinations (animal_id, vaccine_name, date, next_date) VALUES (?, ?, ?, ?)").run(animal_id, vaccine_name, date, next_date);
    res.json({ id: result.lastInsertRowid });
  });

  // Visitors
  app.get("/api/visitors", (req, res) => {
    const visitors = db.prepare("SELECT * FROM visitors ORDER BY entry_time DESC").all();
    res.json(visitors);
  });

  app.post("/api/visitors", (req, res) => {
    const { name, purpose, entry_time, exit_time, protective_gear } = req.body;
    const result = db.prepare("INSERT INTO visitors (name, purpose, entry_time, exit_time, protective_gear) VALUES (?, ?, ?, ?, ?)").run(name, purpose, entry_time, exit_time, protective_gear ? 1 : 0);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/visitors/:id", (req, res) => {
    const { name, purpose, entry_time, exit_time, protective_gear } = req.body;
    db.prepare("UPDATE visitors SET name = ?, purpose = ?, entry_time = ?, exit_time = ?, protective_gear = ? WHERE id = ?").run(name, purpose, entry_time, exit_time, protective_gear ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  // Biosecurity Logs
  app.get("/api/biosecurity", (req, res) => {
    const logs = db.prepare("SELECT * FROM biosecurity_logs ORDER BY date DESC").all();
    res.json(logs);
  });

  app.post("/api/biosecurity", (req, res) => {
    const { date, sanitation_checked, vehicle_disinfected, protective_clothing_checked, equipment_cleaned } = req.body;
    try {
      const result = db.prepare(`
        INSERT INTO biosecurity_logs (date, sanitation_checked, vehicle_disinfected, protective_clothing_checked, equipment_cleaned)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(date) DO UPDATE SET
          sanitation_checked = excluded.sanitation_checked,
          vehicle_disinfected = excluded.vehicle_disinfected,
          protective_clothing_checked = excluded.protective_clothing_checked,
          equipment_cleaned = excluded.equipment_cleaned
      `).run(date, sanitation_checked ? 1 : 0, vehicle_disinfected ? 1 : 0, protective_clothing_checked ? 1 : 0, equipment_cleaned ? 1 : 0);
      res.json({ id: result.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Dashboard Stats
  app.get("/api/stats", (req, res) => {
    const totalPigs = db.prepare("SELECT COUNT(*) as count FROM animals WHERE type = 'Pig'").get() as any;
    const totalPoultry = db.prepare("SELECT COUNT(*) as count FROM animals WHERE type = 'Poultry'").get() as any;
    const recentVaccinations = db.prepare("SELECT COUNT(*) as count FROM vaccinations WHERE next_date >= date('now')").get() as any;
    const biosecurityScore = db.prepare("SELECT AVG(sanitation_checked + vehicle_disinfected + protective_clothing_checked + equipment_cleaned) as avg FROM biosecurity_logs").get() as any;

    res.json({
      pigs: totalPigs.count,
      poultry: totalPoultry.count,
      upcomingVaccinations: recentVaccinations.count,
      complianceRate: biosecurityScore.avg ? (biosecurityScore.avg / 4) * 100 : 0
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
