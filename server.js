import express from "express";
import Database from "better-sqlite3";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const dataDir = path.join(__dirname, "data");
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, "link-kaget.db"));
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS drops (
    id TEXT PRIMARY KEY,
    reward_url TEXT NOT NULL,
    claimed INTEGER NOT NULL DEFAULT 0,
    claimed_at TEXT,
    created_at TEXT NOT NULL
  );
`);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function makeId() {
  return crypto.randomBytes(5).toString("base64url");
}

function validUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

app.post("/api/drops", (req, res) => {
  const rewardUrl = String(req.body?.rewardUrl || "").trim();

  if (!validUrl(rewardUrl)) {
    return res.status(400).json({
      error: "Masukkan link yang valid (http:// atau https://)."
    });
  }

  let id;
  do { id = makeId(); } while (
    db.prepare("SELECT 1 FROM drops WHERE id = ?").get(id)
  );

  db.prepare(`
    INSERT INTO drops (id, reward_url, created_at)
    VALUES (?, ?, ?)
  `).run(id, rewardUrl, new Date().toISOString());

  const base = `${req.protocol}://${req.get("host")}`;
  res.json({ id, claimUrl: `${base}/c/${id}` });
});

app.get("/api/drops/:id", (req, res) => {
  const drop = db.prepare(`
    SELECT id, claimed, claimed_at, created_at
    FROM drops WHERE id = ?
  `).get(req.params.id);

  if (!drop) return res.status(404).json({ error: "Link tidak ditemukan." });
  res.json(drop);
});

app.post("/api/drops/:id/claim", (req, res) => {
  const id = req.params.id;

  // Atomic update: exactly one request can change claimed from 0 to 1.
  const result = db.prepare(`
    UPDATE drops
    SET claimed = 1, claimed_at = ?
    WHERE id = ? AND claimed = 0
  `).run(new Date().toISOString(), id);

  if (result.changes === 1) {
    const drop = db.prepare(`
      SELECT reward_url FROM drops WHERE id = ?
    `).get(id);

    return res.json({
      success: true,
      rewardUrl: drop.reward_url
    });
  }

  const exists = db.prepare("SELECT 1 FROM drops WHERE id = ?").get(id);
  if (!exists) return res.status(404).json({ error: "Link tidak ditemukan." });

  res.status(409).json({
    success: false,
    message: "Yah, hadiah ini sudah diklaim orang lain."
  });
});

app.get("/c/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "claim.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Link Kaget berjalan di port ${PORT}`);
});
