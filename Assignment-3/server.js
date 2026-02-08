import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import flash from "connect-flash";
import { engine } from "express-handlebars";

import "./config/passport.js"; // passport strategy
import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// body parsing
app.use(express.urlencoded({ extended: true }));

// static files
app.use(express.static("public"));

// session (MUST be before passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// passport
app.use(passport.initialize());
app.use(passport.session());

// flash
app.use(flash());

// handlebars
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


// routes
app.use("/", authRoutes);
app.use("/", employeeRoutes);

// db + server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () =>
      console.log(`Server running http://localhost:${PORT}`)
    );
  })
  .catch(console.error);
