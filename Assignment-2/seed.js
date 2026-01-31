import dotenv from "dotenv";

//Import MongoDB
import { MongoClient } from "mongodb";

dotenv.config();


//Reads MongoDB connection from env var
const uri = process.env.MONGO_URI;

//Create new Mongo client
const client = new MongoClient(uri);

//db and collection
const DB_NAME = "todo_app";
const COLLECTION_NAME = "todos";

//Test data for Mongo
const sampleTodos = [
  { userId: 1, id: 1, title: "Finish Assignment 2", completed: true },
  { userId: 1, id: 2, title: "Push code to GitHub", completed: true },
  { userId: 2, id: 3, title: "Move on to next assignment", completed: false },
];

//start seeding with run funct
async function run() {
  try {
    //Connect to Atlas
    await client.connect();
    const db = client.db(DB_NAME);
    const col = db.collection(COLLECTION_NAME);

 
    await col.deleteMany({});

    await col.insertMany(sampleTodos);
    //confirm 
    console.log("Seed complete:", sampleTodos.length, "docs inserted");
  } finally {
    await client.close();
  }
}

run().catch(console.error);