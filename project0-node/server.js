// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

// Needed because you're using "type": "module"
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1) Serve anything inside /public (index.html, read-todo.html, etc.)
app.use(express.static(path.join(__dirname, "public")));

// 2) /todo -> display todo.json as raw JSON (application/json)
app.get("/todo", (req, res) => {
  try {
    const filePath = path.join(__dirname, "todo.json");
    const data = fs.readFileSync(filePath, "utf8");

    res.setHeader("Content-Type", "application/json");
    res.send(data);
  } catch (err) {
    console.error("Error reading todo.json:", err);
    res.status(500).json({ error: "Could not load todo.json" });
  }
});

// 3) Assignment routes (serve the HTML files)
app.get("/index", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/read-todo", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "read-todo.html"));
});

// 4) Default page should be index (if they go to /)
app.get("/", (req, res) => {
  res.redirect(301, "/index.html");
});

// 5) Any fake page -> show index.html
app.use((req, res) => {
  res.redirect(301, "/index.html");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
