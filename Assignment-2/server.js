// Assignment-2/server.js
import express from "express";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- MongoDB setup ---
const uri = process.env.MONGO_URI;
if (!process.env.MONGO_URI) {
  console.error("Missing MONGO_URI in .env");
  process.exit(1);
}


const client = new MongoClient(uri);


const DB_NAME = "todo_app";
const COLLECTION_NAME = "todos";

let collection;

// --- Routes ---
app.get("/todo", async (req, res) => {
  try {
    const todos = await collection.find({}).toArray();
    res.setHeader("Content-Type", "application/json");
    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

app.get("/index", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>SE373 Assignment 2</title>
      </head>
      <body>
        <h1>Idrees Montequiu</h1>

        <h2>Three things I like</h2>
        <ol>
          <li>Coding</li>
          <li>Gaming</li>
          <li>Music</li>
        </ol>

        <h2>Links</h2>
        <ul>
          <li><a href="/todo">/todo (JSON)</a></li>
          <li><a href="/read-todo">/read-todo</a></li>
        </ul>
      </body>
    </html>
  `);
});

app.get("/read-todo", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Read Todos</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .todo { padding: 8px 0; border-bottom: 1px solid #ddd; }
          .done { color: green; }
          .notdone { color: #b00; }
        </style>
      </head>
      <body>
        <h1>Todos (from MongoDB Atlas)</h1>
        <div id="status">Loading...</div>
        <div id="todos"></div>

        <script>
          fetch("/todo")
            .then(res => res.json())
            .then(data => {
              document.getElementById("status").textContent = "";
              const container = document.getElementById("todos");

              data.forEach(todo => {
                const div = document.createElement("div");
                div.className = "todo";

                const status = todo.completed ? "✅" : "❌";
                const cls = todo.completed ? "done" : "notdone";

                div.innerHTML = \`
                  <span class="\${cls}">\${status}</span>
                  <strong>\${todo.title}</strong>
                  <span> (userId: \${todo.userId}, id: \${todo.id})</span>
                \`;

                container.appendChild(div);
              });
            })
            .catch(err => {
              document.getElementById("status").textContent =
                "Error loading todos. Check /todo endpoint.";
              console.error(err);
            });
        </script>
      </body>
    </html>
  `);
});

// Extra credit (optional): GET /todo/:id
app.get("/todo/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const todo = await collection.findOne({ id });

    res.setHeader("Content-Type", "application/json");

    if (!todo) return res.status(404).json({ error: "Todo not found" });
    res.json(todo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch todo" });
  }
});

// Default route / redirect behavior (must be LAST)
app.use((req, res) => {
  res.redirect(301, "/index");
});

// --- Start server after DB connects ---
async function start() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(DB_NAME);
    collection = db.collection(COLLECTION_NAME);

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Mongo connection failed:", err);
    process.exit(1);
  }
}

start();
