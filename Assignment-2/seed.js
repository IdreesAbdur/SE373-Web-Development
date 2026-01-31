import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

const DB_NAME = "todo_app";
const COLLECTION_NAME = "todos";

const sampleTodos = [
  { userId: 1, id: 1, title: "Finish SE373 Assignment 2", completed: false },
  { userId: 1, id: 2, title: "Push code to GitHub", completed: true },
  { userId: 2, id: 3, title: "Test /read-todo page", completed: false },
];

async function run() {
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const col = db.collection(COLLECTION_NAME);

 
    await col.deleteMany({});

    await col.insertMany(sampleTodos);
    console.log("Seed complete:", sampleTodos.length, "docs inserted");
  } finally {
    await client.close();
  }
}

run().catch(console.error);