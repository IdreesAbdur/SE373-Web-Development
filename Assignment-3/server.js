import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { engine } from "express-handlebars";

import employeeRoutes from "./routes/employeeRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.MONGO_URI) {
  console.error("Missing MONGO_URI in .env");
  process.exit(1);
}

// ---- Middleware ----
app.use(express.urlencoded({ extended: true })); 
app.use(express.static("public")); // --->  /public/style.css

// ---- Handlebars setup ----
app.engine(
    "hbs",
    engine({
      extname: "hbs",
      helpers: {
        formatDate: (date) => {
          if (!date) return "";
          return new Date(date).toLocaleDateString();
        },
      },
    })
  );
  
  
app.set("view engine", "hbs");
app.set("views", "./views");

// ---- Routes ----
app.use("/", employeeRoutes);

// ---- DB connects ----
async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB (Mongoose)");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Mongo connection failed:", err);
    process.exit(1);
  }
}

start();
