import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("eco_safe.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- 'safety' | 'environmental'
    severity TEXT NOT NULL, -- 'low' | 'medium' | 'high' | 'critical'
    location TEXT,
    reporter TEXT,
    status TEXT DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS checklists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    items JSON NOT NULL, -- Array of { id, text, completed }
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS environmental_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_type TEXT NOT NULL, -- 'energy' | 'water' | 'waste'
    value REAL NOT NULL,
    unit TEXT NOT NULL,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Seed Data
  INSERT INTO incidents (title, description, type, severity, location, reporter, status)
  SELECT 'Vazamento de óleo hidráulico', 'Pequeno vazamento detectado na prensa 04', 'environmental', 'medium', 'Setor de Estamparia', 'João Silva', 'open'
  WHERE NOT EXISTS (SELECT 1 FROM incidents);

  INSERT INTO incidents (title, description, type, severity, location, reporter, status)
  SELECT 'Falta de uso de protetor auricular', 'Operador trabalhando sem EPI adequado', 'safety', 'low', 'Linha de Montagem', 'Maria Santos', 'closed'
  WHERE NOT EXISTS (SELECT 1 FROM incidents WHERE title = 'Falta de uso de protetor auricular');

  INSERT INTO checklists (title, category, items, status)
  SELECT 'Inspeção Semanal de Extintores', 'Incêndio', '[{"id":"1","text":"Carga ok","completed":true},{"id":"2","text":"Lacre íntegro","completed":false}]', 'pending'
  WHERE NOT EXISTS (SELECT 1 FROM checklists);
`);

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get("/api/incidents", (req, res) => {
    const rows = db.prepare("SELECT * FROM incidents ORDER BY created_at DESC").all();
    res.json(rows);
  });

  app.post("/api/incidents", (req, res) => {
    const { title, description, type, severity, location, reporter } = req.body;
    const info = db.prepare(`
      INSERT INTO incidents (title, description, type, severity, location, reporter)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(title, description, type, severity, location, reporter);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/checklists", (req, res) => {
    const rows = db.prepare("SELECT * FROM checklists ORDER BY created_at DESC").all();
    res.json(rows.map((row: any) => ({ ...row, items: JSON.parse(row.items) })));
  });

  app.post("/api/checklists", (req, res) => {
    const { title, category, items } = req.body;
    const info = db.prepare(`
      INSERT INTO checklists (title, category, items)
      VALUES (?, ?, ?)
    `).run(title, category, JSON.stringify(items));
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/metrics", (req, res) => {
    const rows = db.prepare("SELECT * FROM environmental_metrics ORDER BY recorded_at DESC LIMIT 50").all();
    res.json(rows);
  });

  app.post("/api/metrics", (req, res) => {
    const { metric_type, value, unit } = req.body;
    const info = db.prepare(`
      INSERT INTO environmental_metrics (metric_type, value, unit)
      VALUES (?, ?, ?)
    `).run(metric_type, value, unit);
    res.json({ id: info.lastInsertRowid });
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
