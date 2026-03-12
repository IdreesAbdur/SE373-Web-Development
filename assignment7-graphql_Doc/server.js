import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";

import Employee from "./models/Employee.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/emp";

const app = express();
const httpServer = http.createServer(app);

// ----- GraphQL Schema  -----
const typeDefs = `#graphql
  type Employee {
    id: ID!
    firstName: String!
    lastName: String!
    department: String!
    startDate: String!
    jobTitle: String!
    salary: Float!
  }

  input EmployeeInput {
    firstName: String!
    lastName: String!
    department: String!
    startDate: String!
    jobTitle: String!
    salary: Float!
  }

  input EmployeeUpdateInput {
    firstName: String
    lastName: String
    department: String
    startDate: String
    jobTitle: String
    salary: Float
  }

  type Query {
    employees: [Employee!]!
    employee(id: ID!): Employee
  }

  type Mutation {
    createEmployee(input: EmployeeInput!): Employee!
    updateEmployee(id: ID!, input: EmployeeUpdateInput!): Employee
    deleteEmployee(id: ID!): Boolean!
  }
`;
//CRUD APPLICABILITIES 
const resolvers = {
  Query: {
    employees: async () => Employee.find().sort({ startDate: -1 }),
    employee: async (_, { id }) => Employee.findById(id),
  },

  Mutation: {
    createEmployee: async (_, { input }) => {
      return Employee.create({
        ...input,
        startDate: new Date(input.startDate),
      });
    },

    updateEmployee: async (_, { id, input }) => {
      const update = { ...input };
      if (update.startDate) update.startDate = new Date(update.startDate);

      return Employee.findByIdAndUpdate(id, update, {
        new: true,
        runValidators: true,
      });
    },

    deleteEmployee: async (_, { id }) => {
      const res = await Employee.findByIdAndDelete(id);
      return !!res;
    },
  },

  Employee: {
    id: (parent) => parent._id.toString(),
    startDate: (parent) => new Date(parent.startDate).toISOString().slice(0, 10),
  },
};

async function start() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ MongoDB connected");

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  });

  await server.start();

  // Serve frontend
  app.use(express.static("public"));
  app.use(
    "/graphql",
    cors(),
    express.json(),
    (req, _res, next) => {
      // Apollo expects req.body to exist (even on GET /graphql)
      if (req.body == null) req.body = {};
      next();
    },
    expressMiddleware(server)
  );

  httpServer.listen(PORT, () => {
    console.log(`✅ Server running: http://localhost:${PORT}`);
    console.log(`✅ GraphQL ready:  http://localhost:${PORT}/graphql`);
  });
}

start().catch((err) => console.error("❌ Server failed to start:", err));